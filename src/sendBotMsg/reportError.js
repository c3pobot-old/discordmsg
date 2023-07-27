'use strict'
module.exports = (msg, opts = {}, data = {})=>{
  try{
    let msg2send = (new Date())?.toLocaleString('en-US', {timeZone: 'America/New_York'})
    msg2send += '\ncmd : '+data.method
    if(opts.sId) msg2send += '\nsId : '+opts.sId
    if(data.chId) msg2send += '\nchId : '+data.chId
    if(data.dId) msg2send += '\ndId : '+data.dId
    msg2send += '\n'+JSON.stringify(msg)
    console.error(msg2send);
  }catch(e){
    console.error(e);
  }
}
