// 观察者模式 需要有两个类

/**
 * @name 被观察者
 * @description 收集观察者
 * @class Subject
 */
class Subject {
  constructor(name) {
    this.name = name;
    this.observers = [];
    this.state = false
  }
  // 添加观察者
  attach(obs) {
    this.observers.push(obs);
  }
  // 数据改变，通知观察者
  setState(state) {
    this.state = state ? 'open' : 'close';
    this.observers.forEach(obs => obs.update(this.state))
  }
}

/**
 * @name 观察者
 * @description 监听被观察者数据改变
 * @class Observer
 */
class Observer {
  constructor(name) {
    this.name = name;
  }
  // 被观察者通知触发的方法
  update(state) {
    console.log(this.name + ':' + '收到状态是' + state)
  }
}

const sub = new Subject('电灯');
const obs1 = new Observer('路人甲');
const obs2 = new Observer('路人乙');
sub.attach(obs1);
sub.attach(obs2);
sub.setState(true)