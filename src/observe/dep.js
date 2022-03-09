let id = 0
class Dep {
  constructor() {
    this.id = id++
    // 属性的dep要收集 watcher
    this.subs = [] // 存放当前属性对应得watcher
  }

  depend() {
    // 不希望重复收集 watcher
    Dep.target.addDep(this) // 让 watcher 也记住 dep， 他们之间的关系就是多对多
  }

  addSub(watcher) {
    this.subs.push(watcher)
  }

  notify(){
      this.subs.forEach(watcher=>watcher.update())
  }
}
Dep.target = null
export default Dep
