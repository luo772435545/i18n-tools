const shell = require('shelljs');
const path = require('path');
const fs = require('fs');

const config = require('./config/config.js') ;

var filePath = path.resolve(config.entry);

//调用文件遍历方法
fileDisplay(filePath);

shell.rm('-rf', config.langOutput);
shell.rm('-rf', config.output);
let code = 1000000;
let obj={};

function fileDisplay(filePath){
  //根据文件路径读取文件，返回文件列表
  fs.readdir(filePath,function(err,files){
    if(err){
      console.warn(err)
    }else{
      //遍历读取到的文件列表
      files.forEach(function(filename){
        //获取当前文件的绝对路径
        var filedir = path.join(filePath, filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        fs.stat(filedir,function(eror, stats){
          if(eror){
            console.warn('获取文件失败');
          }else{
            var isFile = stats.isFile();//是文件
            var isDir = stats.isDirectory();//是文件夹
            if(isFile){
              if(path.basename(filedir).indexOf('.vue') > -1) {
                  let content = fs.readFileSync(filedir, 'utf-8');
                  var tem = content.slice(content.indexOf('<template'),content.lastIndexOf('template')+9);
                  var scriptAll = content.slice(content.indexOf('<script'),content.lastIndexOf('script')+7);
                  var style=content.replace(tem,'').replace(scriptAll,'');

                  var zhReg = /[\u4e00-\u9fa5]+/;
                  var te =/[$()[*+}\]?^{|]/g;
                  var zh = tem.match(/>[^<>]+</g);
                  zh.forEach((item,index)=>{
                      if(zhReg.test(item)){
                          code++;
                          console.log(item)
                          let zhText = item.slice(1,-1).toString().replace(/(^\s*)|(\s*$)|(\n)/g,'');
                          obj[config.messageName+code] = zhText;
                          if(item.indexOf('+')>-1){
                              item=item.replace('+','.')
                          }
                          var reg = new RegExp(item.replace(te,'.'),'g');
                          tem=  tem.replace(reg,`>{{${config.i18n}('${config.filePrefix}.${config.messageName}${code}')}}<`)
                      }
                  });
                  var label = tem.match(/<[^<>]+>/g);
                  var dotReg = /('[^']*')|("[^"]*")/g;
                  label.forEach(item=>{
                      var attr = item.split(' ');
                      attr.forEach(attrItem=>{
                          if(zhReg.test(attrItem)) {
                              code++;
                              tem=  tem.replace(attrItem,`:${attrItem}`);
                              if(attrItem.match(dotReg) && attrItem.match(dotReg)[0]) {
                                  let zhText = attrItem.match(dotReg)[0];
                                  let zh =zhText.replace(/"/g,'')
                                  obj[config.messageName+code] = zh;
                                  var reg = new RegExp(zhText.replace(te,'.'),'g');
                                  tem=  tem.replace(reg,`"${config.i18n}('${config.filePrefix}.${config.messageName}${code}')"`)
                              }
                          }
                      })
                  });

                  var scrAttr = scriptAll.match(dotReg);

                  scrAttr.forEach(item=>{
                      if(zhReg.test(item)) {
                          code++;
                          let zh =item.slice(1,-1);
                          obj[config.messageName+code] = zh;
                          var reg = new RegExp(item.replace(te.toString(),'.'),'g');
                          scriptAll=  scriptAll.replace(reg,`${config._this}.${config.i18n}('${config.filePrefix}.${config.messageName}${code}')`)
                      }
                  });


                  let ouputPath = config.output+'/'+path.relative(config.entry,path.dirname(filedir)).replace(/\\/g,'/');
                  shell.mkdir('-p',ouputPath);
                 /* shell.mkdir('-p',config.langOutput);*/
                  fs.writeFile(ouputPath+'/'+path.basename(filedir), tem+scriptAll+style ,function(err){
                      if(err) console.log('写文件操作失败');
                      else console.log('写文件操作成功');
                  });
                  fs.writeFile(config.langOutput, `export default ${JSON.stringify(obj)}`,function(err){
                      if(err) console.log('写文件操作失败');
                      else console.log('写文件操作成功');
                  });
              }else {
                  let content = fs.readFileSync(filedir, 'utf-8');
                  let ouputPath = config.output+'/'+path.relative(config.entry,path.dirname(filedir)).replace(/\\/g,'/');
                  shell.mkdir('-p',ouputPath);
                  fs.writeFile(ouputPath+'/'+path.basename(filedir), content ,function(err){
                      if(err) console.log('写文件操作失败');
                      else console.log('写文件操作成功');
                  });
              }
            }
            if(isDir){
              fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
            }
          }
        })
      });
    }
  });
}


