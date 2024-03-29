import React, { Component } from 'react';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import _ from 'lodash';
import bgStreamFactory from './bgStreamFactory';
import BGView from './BGView';
import Context from '../bgContext';

export default class BGContainer extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.stream = bgStreamFactory(props.size, props.history);
    this.resizeApp = _.debounce(() => this.stream.do.resizeApp(this.props.size), 200);
  }

  componentDidMount() {
    const { size } = this.props;
    const ele = _.get(this, 'ref.current');
    if (ele) {
      this.stream.do.tryInit(ele, size);
    }
    this.moveSub = fromEvent(window, 'mousemove')
      .pipe(throttleTime(100))
      .subscribe((event) => {
        this.stream.do.updateMousePos(_.get(event, 'clientX', 0), _.get(event, 'clientY', 0));
      });

    this.stream.subscribe(() => {
      // this is one of the odd comp0onents that DOESN'T re-render on stream update
    }, (err) => {
      console.log('stream error: ', err);
    });
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
      <Context.Provider value={this.stream}>
        <BGView reference={this.ref}>
          {this.props.children}
        </BGView>
      </Context.Provider>
    );
  }
}
