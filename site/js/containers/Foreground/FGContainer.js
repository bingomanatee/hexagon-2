import React, {Component} from 'react';
import {fromEvent} from 'rxjs';
import {throttleTime} from 'rxjs/operators';
import _ from 'lodash';
import fgStreamFactory from './fgStreamFactory';
import FGView from './FGView';

export default class FGContainer extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.stream = fgStreamFactory(props);
    this.state = {galaxy: null};
    this.resizeApp = _.debounce(() => this.stream.do.resizeApp(this.props.size), 200);
  }

  componentDidMount() {
    const {size} = this.props;
    const ele = _.get(this, 'ref.current');
    if (ele) {
      this.stream.do.tryInit(ele, size);
    }
    this.moveSub = fromEvent(window, 'mousemove')
      .pipe(throttleTime(100))
      .subscribe((event) => {
        this.stream.do.updateMousePos(_.get(event, 'clientX', 0), _.get(event, 'clientY', 0));
      });

    this.stream.subscribe((stream) => {
        this.setState({galaxy: stream.get('currentGalaxy')});
      },
      (err) => {
        console.log('galaxy stream error: ', err);
      });

    this.stream.watch('currentGalaxy', (galaxy) => {
      console.log('current galaxy: ', galaxy);
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
      <FGView reference={this.ref} {...this.state} />
    );
  }
}
