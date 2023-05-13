import { HttpService, Injectable, Scope } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { GetObjectRequest, PutObjectRequest } from 'aws-sdk/clients/s3';
import { FileUpload } from 'graphql-upload';
import { v4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';
import { transliterate as tr } from 'transliteration';
import { Context } from '../common/context';
import { BaseService } from '../common/base.service';
import { BucketConfig, PdfConverter, RedisConfig } from '../config/base.config';
import { File } from './entities/file.entity';
import { FileNotFoundException } from '../common/exceptions';
import { getOrThrow } from '../util/guards';
import { CacheService } from '../cache/cache.service';

const sharp = require('sharp');
const smartcrop = require('smartcrop-sharp');

@Injectable({ scope: Scope.REQUEST })
export class FileService extends BaseService {
  private s3: S3;

  private bucketConfig: BucketConfig;

  private redisConfig: RedisConfig;

  private pdfConverterConfig: PdfConverter;

  constructor(
    private readonly config: ConfigService,
    private readonly cache: CacheService,
    private readonly httpService: HttpService,
  ) {
    super();
    this.bucketConfig = this.config.get<BucketConfig>('bucketConfig');
    this.redisConfig = this.config.get<RedisConfig>('redis');
    this.pdfConverterConfig = this.config.get<PdfConverter>('pdfConverter');

    this.s3 = new S3({
      accessKeyId: this.bucketConfig.accessKeyId,
      secretAccessKey: this.bucketConfig.secretAccessKey,
      endpoint: this.bucketConfig.endpoint,
    });
  }

  @Context()
  findOneOuter(id: string): Promise<File> {
    return this.findOne(id);
  }

  isImage(file: File): boolean {
    return file.mimetype.indexOf('image') !== -1;
  }

  findOne(id: string): Promise<File> {
    const { trx } = this.ctx;
    return getOrThrow(
      async () => File.query(trx).findById(id),
      new FileNotFoundException(id),
    );
  }

  @Context()
  async preview(id: string) {
    const file = await this.findOne(id);
    let { previewId: s3PreviewId } = file;

    if (this.isImage(file)) {
      s3PreviewId = file.id;
    } else if (!s3PreviewId) {
      const fileStream = await this.download(id);
      const form = new FormData();

      form.append('files', fileStream, {
        filename: tr(file.name), // нужна транслитерация имени, иначе конвертация падает
      });

      const response = await this.httpService.post(
        `${this.pdfConverterConfig.url}/forms/libreoffice/convert`,
        form,
        {
          headers: {
            ...form.getHeaders(),

          },
          responseType: 'stream',
        },
      ).toPromise();

      const uploadData = await this.uploadPreview(id, response.data);
      s3PreviewId = uploadData.previewId;
    }

    return this.download(s3PreviewId);
  }

  @Context()
  async upload(attachment: FileUpload): Promise<File> {
    const { date, trx } = this.ctx;
    const file = await attachment;
    const key = v4();

    const params: PutObjectRequest = {
      Bucket: this.bucketConfig.bucket,
      Key: key,
      Body: file.createReadStream(),
    };

    await this.s3.upload(params).promise();

    const newFileData: Partial<File> = {
      id: key,
      name: file.filename,
      mimetype: file.mimetype,
      created: date,
      updated: date,
    };

    return File
      .query(trx)
      .insert(newFileData)
      .returning('*');
  }

  async uploadPreview(id: string, stream: ReadableStream): Promise<File> {
    const { date, trx } = this.ctx;
    const key = v4();

    const params: PutObjectRequest = {
      Bucket: this.bucketConfig.bucket,
      Key: key,
      Body: stream,
    };

    await this.s3.upload(params).promise();

    const patchData: Partial<File> = {
      previewId: key,
      updated: date,
    };

    return File
      .query(trx)
      .patchAndFetchById(id, patchData);
  }

  async getResize(id: string, width: number, height: number) {
    const resizeKey = `${id}-resize-${width}-${height}`;
    let buf = await this.cache.getBuffer(resizeKey);

    if (!buf) {
      const object = await this.getS3Object(id);

      const { topCrop: crop } = await smartcrop
        .crop(
          object.Body,
          { width: +width, height: +height },
        );

      const stream = sharp(object.Body)
        .extract({
          width: crop.width,
          height: crop.height,
          left: crop.x,
          top: crop.y,
        })
        .resize(+width, +height);

      buf = await stream.toBuffer({ resolveWithObject: false });
      await this.cache.set(resizeKey, buf);
      await this.cache.setExpiration(resizeKey, this.redisConfig.imageCacheTtl);
    }

    return buf;
  }

  download(s3Id: string) {
    const params: GetObjectRequest = {
      Bucket: this.bucketConfig.bucket,
      Key: s3Id,
    };
    return this.s3.getObject(params).createReadStream();
  }

  getS3Object(s3Id: string) {
    const params: GetObjectRequest = {
      Bucket: this.bucketConfig.bucket,
      Key: s3Id,
    };
    return this.s3.getObject(params).promise();
  }
}
