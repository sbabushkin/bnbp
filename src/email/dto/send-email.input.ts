export class SendEmailInput {
  constructor(params: SendEmailInput = {} as SendEmailInput) {
    this.subject = params.subject;
    this.recipients = params.recipients;
    this.sender = params.sender;
    this.text = params.text;
    this.html = params.html;
    this.senderName = params.senderName;
    this.carbonCopies = params.carbonCopies;
    this.blindCarbonCopies = params.blindCarbonCopies;
  }

  subject: string;

  recipients: string[];

  sender?: string;

  text?: string;

  html?: string;

  senderName?: string;

  carbonCopies?: string[];

  blindCarbonCopies?: string[];
}
