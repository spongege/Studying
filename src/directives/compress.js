/*
 * @Author: feng.zhonghui
 * @Date: 2019-08-28 13:29:19
 * @Last Modified by: feng.zhonghui
 * @Last Modified time: 2019-11-21 16:26:11
 * @des 上传图片压缩指令
 *  <input type="file" v-compress="{limit: 1, quality: 0.5, success}">
 *  limit: 超过这个大小才会进行压缩，默认为1M
 *  quality：图片压缩质量，默认为 limit/图片大小，可传的值为 0~1
 *  success： 成功回调，第一个参数为压缩以后的file文件
 */
export default Vue => {
  let limit, quality, success
  const compressFunc = (ele, binding) => {
    ;({ limit = 1, quality, success } = binding.value)
    ele.addEventListener('change', changeFunc)
  }

  const changeFunc = e => {
    let fileObj = e.target.files[0] //获取file
    if (!fileObj || !fileObj.type.includes('image')) return
    const size = fileObj.size / 1024 / 1024
    console.log('压缩前大小', size + 'M')
    if (size >= limit) {
      //文件大于limit（根据需求更改），进行压缩上传
      canvasDataURL(
        getObjectURL(fileObj),
        {
          qua: limit / size
        },
        urlData => {
          const fileObj = base64UrlToBlob(
            urlData,
            'file_' + Date.now() + '.jpg'
          )
          console.log('压缩后大小', fileObj.size / 1024 / 1024 + 'M')
          success(fileObj)
        }
      )
    } else {
      // 直接把file文件传到成功回调上
      success(fileObj)
    }
  }

  const canvasDataURL = (path, obj, callback) => {
    let img = new Image()
    img.src = path
    img.onload = function() {
      let that = this //指到img
      // 默认按比例压缩
      let w = that.width,
        h = that.height,
        scale = w / h
      w = obj.width || w
      h = obj.height || w / scale
      let qua = quality ? quality : obj.qua
      //生成canvas
      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')
      // 创建属性节点
      let anw = document.createAttribute('width')
      anw.nodeValue = w
      let anh = document.createAttribute('height')
      anh.nodeValue = h
      canvas.setAttributeNode(anw)
      canvas.setAttributeNode(anh)
      ctx.drawImage(that, 0, 0, w, h)

      // qua值越小，所绘制出的图像越模糊
      let base64 = canvas.toDataURL('image/jpeg', qua)
      // 回调函数返回base64的值
      callback(base64)
    }
  }

  const getObjectURL = file => {
    let url = null
    if (window.createObjectURL != undefined) {
      // basic
      url = window.createObjectURL(file)
    } else if (window.URL != undefined) {
      // mozilla(firefox)
      url = window.URL.createObjectURL(file)
    } else if (window.webkitURL != undefined) {
      // webkit or chrome
      url = window.webkitURL.createObjectURL(file)
    }
    return url
  }

  const base64UrlToBlob = (urlData, fileName) => {
    let arr = urlData.split(','),
      mime = arr[0].match(/:(.*?);/)[1], // 去掉url的头，并转化为byte
      bstr = atob(arr[1]), // 处理异常,将ascii码小于0的转换为大于0
      n = bstr.length,
      u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], fileName, {
      type: mime
    })
    //转file
    //return new File([u8arr], filename, {type:mime});
  }

  Vue.directive('compress', {
    bind: compressFunc
    // inserted: compressFunc,
    // update: compressFunc
  })
}
