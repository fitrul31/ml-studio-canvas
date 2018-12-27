import React, { PureComponent } from "react";
import { connect } from "react-redux";

import WirePathComponent from "./WirePathComponent";
import WireHeadComponent from "./WireHeadComponent";
import WireDragComponent from "./WireDragComponent";
import WireTextComponent from "./WireTextComponent";

class WireLayerComponent extends PureComponent {
  render() {
    return (
      <div className="wire-layer">
        <svg className="wire-path-layer">
          {this.props.wires.map((w, i) => (
            <WirePathComponent key={i} wire={w} />
          ))}
        </svg>
        <svg className="wire-path-head-layer">
          {this.props.wires.map((w, i) => (
            <WireHeadComponent key={i} wire={w} />
          ))}
        </svg>
        <div className="wire-drag-layer">
          {this.props.wires.map((w, i) => (
            <WireDragComponent key={i} wire={w} />
          ))}
        </div>
        <div className="wire-text-layer">
          {this.props.wires.map((w, i) => (
            <WireTextComponent key={i} wire={w} />
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  wires: state.present.wires,
  wireCreationOn: state.present.wireCreationOn
});

export default connect(mapStateToProps)(WireLayerComponent);
