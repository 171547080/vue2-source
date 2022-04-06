/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
// 遍历列出的方法
methodsToPatch.forEach(function (method) {
  // cache original method
  // 缓存原有的方法
  const original = arrayProto[method]
  
  def(arrayMethods, method, function mutator (...args) {
    // 调用原生方法
    const result = original.apply(this, args)

    // 该数组是响应式的时候，拿到数组上的 __ob__ 属性
    const ob = this.__ob__
    let inserted
    // 处理如果是数组添加的对象或者是数组
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    
    // 监听操作完成后的数组
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 重点！每个响应式数组上都会有一个 __ob__ 利用我们保留的 __ob__ 属性获取 notify 方法更新视图
    ob.dep.notify()
    return result
  })
})
