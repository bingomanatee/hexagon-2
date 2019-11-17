import React, { Component } from 'react';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import _ from 'lodash';
import makeHomeStore from './bgStoreFactory';
import BGView from './BGView';

export default class BGContainer extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.store = makeHomeStore(props.size);
    this.resizeApp = _.debounce(() => this.store.do.resizeApp(this.props.size), 200);
  }

  componentDidMount() {
    const { size } = this.props;
    const ele = _.get(this, 'ref.current');
    if (ele) {
      this.store.do.tryInit(ele, size);
    }
    this.moveSub = fromEvent(window, 'mousemove')
      .pipe(throttleTime(100))
      .subscribe((event) => {
        this.store.do.updateMousePos(_.get(event, 'clientX', 0), _.get(event, 'clientY', 0));
      });

    this.store.subscribe(() => {
      // this is one of the odd comp0onents that DOESN'T re-render on store update
    }, (err) => { console.log('store error: ', err); });
  }

  componentDidUpdate(prevProps) {
    const prevWidth = _.get(prevProps, 'size.width');
    const prevHeight = _.get(prevProps, 'size.height');
    if (prevWidth !== _.get(this, 'props.size.width') || prevHeight !== _.get(this, 'props.size.height')) {
      this.resizeApp();
    }
  }

  render() {
    return (
      <BGView reference={this.ref} />
    );
  }
}
