/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  //给 dep 添加对应的 watch
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

   //给 watcher 添加 Dep
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  //调用 watcher 里的渲染函数
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
//正在评估的当前目标观察者。
//这是全局唯一的，因为一次只能评估一个观察者。
Dep.target = null
const targetStack = []

// 渲染阶段，访问页面上的属性变量时，给对应的 Dep 添加 watcher
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}
// 访问结束后删除
export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
