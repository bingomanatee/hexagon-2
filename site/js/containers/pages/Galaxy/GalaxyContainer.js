import React, {Component} from 'react';
import _ from 'lodash';
import GalaxyView from './GalaxyView';
import {getUniverse} from '../../Foreground/fgStreamFactory';

export default class GalaxyContainer extends Component {
  constructor(props) {
    super(props);
    const galaxyName = _.get(props, 'match.params.id', '---');
    this.state = {uStream: null, id: galaxyName};
    console.log('galaxy name:', galaxyName);
  }

  componentDidMount() {
    this.mounted = true;
    this._tryToGetUniverse();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  _tryToGetUniverse() {
    const u = getUniverse();
    if (u) {
      if (this.mounted) {
        this.setState({uStream: u});
      }
      const {id} = this.state;
      if (id) {
        u.do.setCurrentGalaxyName(id);
      }

    } else {
      requestAnimationFrame(() => {
        this._tryToGetUniverse();
      });
    }
  }

  render() {
    return (
      <GalaxyView galaxyName={this.state.id}/>
    );
  }
}
