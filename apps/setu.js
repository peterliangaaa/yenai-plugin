import plugin from '../../../lib/plugins/plugin.js'
import { Config } from '../components/index.js'
import { setu, common } from '../model/index.js'
import { Setting } from './setting.js'
const SWITCH_ERROR = '主人没有开放这个功能哦(＊／ω＼＊)'

let NumReg = '[一壹二两三四五六七八九十百千万亿\\d]+'
let seturdReg = new RegExp(`^#(setu|无内鬼)\\s?((${NumReg})张)?$`)
let setcdReg = new RegExp(`^#?设置cd\\s?(\\d+)\\s(${NumReg})(s|秒)?$`, 'i')
export class SeSe extends plugin {
  constructor () {
    super({
      name: '椰奶setu',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#椰奶tag(.*)$',
          fnc: 'setutag'
        },
        {
          reg: seturdReg, // 无内鬼
          fnc: 'seturd'
        },
        {
          reg: `^#(撤回间隔|群(c|C)(d|D))(${NumReg})(s|秒)?$`,
          fnc: 'setGroupRecallAndCD',
          event: 'message.group',
          permission: 'master'
        },
        {
          reg: '^#(开启|关闭)(私聊)?涩涩$',
          fnc: 'setsese',
          permission: 'master'
        },
        {
          reg: `^#?(c|C)(d|D)(${NumReg})(s|秒)?$`,
          fnc: 'atSetCd',
          event: 'message.group',
          permission: 'master'
        },
        {
          reg: setcdReg, // 设置cd
          fnc: 'setCd',
          permission: 'master'
        }
      ]
    })
  }

  async seturd (e) {
    if (!await this.Authentication(e)) return

    let iscd = setu.getRemainingCd(e.user_id, e.group_id)

    if (iscd) return e.reply(` ${setu.CDMsg}你的CD还有${iscd}`, false, { at: true })

    let num = seturdReg.exec(e.msg)

    num = num[3] ? common.translateChinaNum(num[3]) : 1

    if (num > 20) {
      return e.reply('❎ 最大张数不能大于20张')
    } else if (num > 6) {
      e.reply('你先等等，你冲的有点多~')
    } else {
      e.reply(setu.startMsg)
    }

    await setu.setuApi(setu.getR18(e.group_id), num)
      .then(res => setu.sendMsgOrSetCd(e, res))
      .catch(err => e.reply(err.message))
  }

  // tag搜图
  async setutag (e) {
    if (!await this.Authentication(e)) return

    let iscd = setu.getRemainingCd(e.user_id, e.group_id)
    if (iscd) return e.reply(` ${setu.CDMsg}你的CD还有${iscd}`, false, { at: true })

    let tag = e.msg.replace(/#|椰奶tag/g, '').trim()
    let num = e.msg.match(new RegExp(`(${NumReg})张`))
    if (!num) {
      num = 1
    } else {
      tag = tag.replace(num[0], '').trim()
      num = common.translateChinaNum(num[1])
    }

    if (num > 20) {
      return e.reply('❎ 最大张数不能大于20张')
    } else if (num > 6) {
      e.reply('你先等等，你冲的有点多~')
    } else {
      e.reply(setu.startMsg)
    }

    if (!tag) return e.reply('tag为空！！！', false, { at: true })
    tag = tag.split(' ')?.map(item => item.split('|'))
    if (tag.length > 3) return e.reply('tag最多只能指定三个哦~', false, { at: true })

    await setu.setuApi(setu.getR18(e.group_id), num, tag)
      .then(res => setu.sendMsgOrSetCd(e, res))
      .catch(err => e.reply(err.message))
  }

  async Authentication (e) {
    if (e.isMaster) return true
    if (!Config.setu.allowPM && !e.isGroup) {
      e.reply('主人已禁用私聊该功能')
      return false
    }
    if (!Config.getGroup(e.group_id).sesepro) {
      e.reply(SWITCH_ERROR)
      return false
    }
    if (!await common.limit(e.user_id, 'setu', Config.setu.limit)) {
      e.reply('[setu]您已达今日次数上限', true, { at: true })
      return false
    }
    return true
  }

  // 设置群撤回间隔和cd
  async setGroupRecallAndCD (e) {
    let num = e.msg.match(new RegExp(NumReg))
    num = common.translateChinaNum(num[0])
    let type = /撤回间隔/.test(e.msg)
    setu.setGroupRecallTimeAndCd(e.group_id, num, type)
    new Setting().View_Settings(e)
  }

  // 开启r18
  async setsese (e) {
    let isopen = !!/开启/.test(e.msg)
    setu.setR18(e.group_id, isopen)
    new Setting().View_Settings(e)
  }

  // 艾特设置cd
  async atSetCd (e) {
    let qq = e.message.find(item => item.type == 'at')?.qq

    if (!qq) return false

    let cd = e.msg.match(new RegExp(NumReg))

    if (!cd) return e.reply('❎ CD为空，请检查', true)

    cd = common.translateChinaNum(cd[0])

    setu.setUserCd(e, qq, cd)
  }

  // 指令设置
  async setCd (e) {
    let cdreg = setcdReg.exec(e.msg)
    let qq = cdreg[1]
    let cd = common.translateChinaNum(cdreg[2])
    setu.setUserCd(e, qq, cd)
  }
}
