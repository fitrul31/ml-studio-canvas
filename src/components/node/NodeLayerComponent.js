import React, { PureComponent } from "react";
import { connect } from "react-redux";

import NodeComponent from "./NodeComponent";

class NodeLayerComponent extends PureComponent {
  render() {
    return (
      <div className="node-layer">
        {this.props.nodes.map(n => <NodeComponent key={n.id} node={n} />)}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  nodes: state.present.nodes,
  wireCreationOn: state.present.wireCreationOn,
  dragStatus: state.present.dragStatus
});

export default connect(mapStateToProps, null)(NodeLayerComponent);
