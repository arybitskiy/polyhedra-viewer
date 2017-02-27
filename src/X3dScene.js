import React, { Component } from 'react';
// TODO don't rely on this syntax and put this in the webpack config
// (do this once we've ejected from create-react-app
import x3dom from 'exports?x3dom!x3dom'; // eslint-disable-line import/no-webpack-loader-syntax
import 'x3dom/x3dom.css';
import './X3dScene.css';

export default class X3dScene extends Component {
  componentDidMount() {
    // Reload X3DOM so that it tracks the re-created instance
    x3dom.reload();
    // Disable double-clicking to change rotation point
    x3dom.Viewarea.prototype.onDoubleClick = () => {}
  }

  render() {
    return (
      <x3d className="X3dScene">
        <scene>
          <viewpoint is position="0,0,5"></viewpoint>
          { this.props.children }
        </scene>
      </x3d>
    );
  }
}
