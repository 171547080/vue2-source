/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'

export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  // 每一个组件实例都有一个唯一的 cid 
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   */
  // Vue.extend 方法实体
  Vue.extend = function (extendOptions: Object): Function {
    // 用户传进来的参数，包含组件实例的对象
    extendOptions = extendOptions || {}
    // 将 Super 指向父类 this ，也就是 Vue
    const Super = this
    // SuperId 使用父类的唯一cid
    const SuperId = Super.cid
    // 创建缓存，有缓存直接返回缓存
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }
    // 组件实例 name 
    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      validateComponentName(name)
    }
    // 子组件的构造函数
    const Sub = function VueComponent (options) {
      this._init(options)
    }
    // 通过create继承父类原型
    Sub.prototype = Object.create(Super.prototype)
    // 修改子类 constructor 指向自己
    Sub.prototype.constructor = Sub
    // 创建子类唯一 cid
    Sub.cid = cid++
    // 合并父类 options 和子类自有 options
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // 子类有props,初始化子类props，并创建监听
    if (Sub.options.props) {
      initProps(Sub)
    }
    // 子类有 computed，初始化 computed，并创建监听，流程和上边 computed 实现一样
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    // 用于递归组件
    if (name) {
      // 给组件的components添加上组件自己
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    // 上边说的缓存
    cachedCtors[SuperId] = Sub
    return Sub
  }
}

function initProps (Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
