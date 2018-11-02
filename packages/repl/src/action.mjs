import os from 'os'
import fs from 'fs'
import path from 'path'
import repl from 'repl'
import fsp from 'promisified-core/fs'
import Action from '@atlas.js/action'

class Repl extends Action {
  static config = {
    type: 'object',
    additionalProperties: false,
    default: {},
    properties: {
      historyFile: {
        type: 'string',
        default: path.resolve(os.homedir(), '.node_repl_history'),
      },
      username: {
        type: 'string',
        default: os.userInfo().username,
      },
      prompt: {
        type: 'string',
        default: '✏️ ',
      },
      greet: {
        type: 'boolean',
        default: true,
      },
      newlines: {
        type: 'object',
        additionalProperties: false,
        default: {},
        properties: {
          unix: {
            type: 'string',
            default: '\n',
          },
          win32: {
            type: 'string',
            default: '\r\n',
          },
        },
      },
    },
  }

  async enter(options = {}) {
    this.io = {
      in: options.input || process.stdin,
      out: options.output || process.stdout,
      nl: options.nl || os.EOL,
    }

    if (this.io.nl in this.config.newlines) {
      this.io.nl = this.config.newlines[this.io.nl]
    }

    if (this.config.greet) {
      this::say(`${this.io.nl}Hello, ${this.config.username}`)
      this::say('Type `atlas` to play around. Have fun!')
    }

    const history = await this::readHistory()
    const terminal = repl.start({
      input: this.io.in,
      output: this.io.out,
      prompt: this.config.prompt,
      useGlobal: true,
      ignoreUndefined: true,
      breakEvalOnSigint: true,
      replMode: repl.REPL_MODE_STRICT,
    })

    terminal.history = history
    terminal.context.atlas = this.atlas
    terminal.once('exit', () => {
      if (this.config.greet) {
        this::say('Bye 👋')
      }
    })

    await new Promise((resolve, reject) => {
      terminal.once('error', reject)
      terminal.once('exit', resolve)
    })
    await this::saveHistory(terminal.lines)
  }
}

function say(message) {
  this.io.out.write(`${message}${this.io.nl}`)
}

async function readHistory() {
  const file = this.config.historyFile

  if (!file) {
    return []
  }

  // Load history. This requires a wee bit of work, Node does not provide built-in support for
  // history persistence in custom REPL servers... 😡
  const exists = await new Promise(resolve =>
    fs.access(file, fs.constants.F_OK | fs.constants.W_OK, err =>
      err
        ? resolve(false)
        : resolve(true)))

  const inputs = exists
    ? (await fsp.readFile(file, 'utf8'))
      .split(os.EOL)
      .reverse()
      .filter(line => line.trim())
    : []

  return inputs
}

async function saveHistory(inputs) {
  const file = this.config.historyFile

  if (!file) {
    return
  }

  const text = inputs.filter(line => line.trim()).join(os.EOL)
  await fsp.appendFile(file, `${text}${os.EOL}`)
}

export default Repl
