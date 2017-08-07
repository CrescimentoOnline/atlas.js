import nodemailer from 'nodemailer'
import { Service as Nodemailer } from '../..'

describe('Nodemailer - instance::send()', () => {
  let instance
  let client
  let transport

  beforeEach(async function() {
    transport = {
      sendMail: sinon.stub().callsArgWithAsync(1, null, {}),
      transporter: { name: 'loltransport' },
      close: sinon.stub(),
    }
    this.sb.each.stub(nodemailer, 'createTransport').returns(transport)

    instance = new Nodemailer({
      log: {
        child: sinon.stub(),
      },
      config: {
        transport: () => {},
      },
    })
    client = await instance.prepare()
  })

  it('exists', () => {
    expect(client).to.itself.respondTo('send')
  })

  it('returns Promise', () => {
    expect(client.send({})).to.be.a('promise')
  })

  it('passes the input data to nodemailer\'s sendMail()', async () => {
    const mail = { to: 'test@test.com' }
    await client.send(mail)

    expect(transport.sendMail).to.have.callCount(1)
    expect(transport.sendMail).to.have.been.calledWith(mail)
  })

  it('rejects if the sendMail() fails', () => {
    transport.sendMail.callsArgWithAsync(1, new Error('simulated fail'))

    return expect(client.send({})).to.be.eventually.rejectedWith(/simulated fail/)
  })
})