import React, { Component } from 'react';
import { fromEvent } from 'rxjs';

import { throttleTime } from 'rxjs/operators';
import styled from 'styled-components';
import _ from 'lodash';
import makeHomeStore from './bgStoreFactory';
import BGView from './BGView';

export default class BGContainer extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.store = makeHomeStore(props.size);
    this.resizeApp = _.debounce(() => this.store.do.resizeApp(this.props.size), 500);
  }

  componentDidMount() {
    const { size } = this.props;
    const ele = _.get(this, 'ref.current');
    if (ele) {
      this.store.do.tryInit(ele, size);
    }
    this.moveSub = fromEvent(window, 'mousemove')
      .pipe(throttleTime(10))
      .subscribe((event) => {
        if (_.get(event, 'clientX')) {
          this.store.do.updateFromX(_.get(event, 'clientX'));
        }
      });
  }

  componentDidUpdate(prevProps) {
    const size = _.get(this, 'props.size');
    const prevWidth = _.get(prevProps, 'size.width');
    const prevHeight = _.get(prevProps, 'size.height');
    if (prevWidth !== _.get(this, 'props.size.width') || prevHeight !== _.get(this, 'props.size.height')) {
      this.resizeApp();
    }
  }

  render() {
    return (
      <BGView reference={this.ref}>
        <h1>Home Page</h1>
      </BGView>
    );
  }
}
