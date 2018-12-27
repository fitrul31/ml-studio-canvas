import React, { PureComponent } from "react";
import { connect } from "react-redux";

import NodeTextComponent from "./NodeTextComponent";
import NodeResizerComponent from "./NodeResizerComponent";
import ConnectorsComponent from "./ConnectorsComponent";
import WireCreatorComponent from "./WireCreatorComponent";
import {
  handleSelectionOnPress,
  handleSelectionOnRelease,
  handleSelectionOnClick
} from "../../helpers/handleSelection";
import {
  prepareNodeDrag,
  dragNodes,
  resizeNode
} from "../../actions/nodeActions";
import { addWire, dragWire } from "../../actions/wireActions";
import { setDragStatus, clearDragStatus } from "../../actions/globalActions";
import {
  startTextEditing,
  onTextChange,
  finishAnyTextEditing
} from "../../actions/textActions";
import {
  beginUserAction,
  completeUserAction,
  discardUserAction
} from "../../actions/undoActions";
import { clearSelection } from "../../actions/selectionActions";

const dragThreshold = 3;
const hoverOutline = 5; // Adds a transparent outline to capture hover events.

class NodeComponent extends PureComponent {
  componentDidMount() {
    this.element.addEventListener("mousedown", this.onMouseDown);
    this.element.addEventListener("click", this.onClick);
    this.element.addEventListener("dblclick", this.onDoubleClick);
    document.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("blur", this.endDrag);
  }

  componentWillUnmount() {
    this.element.removeEventListener("mousedown", this.onMouseDown);
    this.element.removeEventListener("click", this.onClick);
    this.element.removeEventListener("dblclick", this.onDoubleClick);
    document.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("blur", this.endDrag);
  }

  render() {
    const x = this.props.node.x - hoverOutline + "px";
    const y = this.props.node.y - hoverOutline + "px";
    const backgroundStyle = {
      transform: "translate3d(" + x + " ," + y + ", 0px)",
      width: this.props.node.width + 2 * hoverOutline + 1 + "px",
      height: this.props.node.height + 2 * hoverOutline + 1 + "px"
    };
    const className = "node" + (this.props.node.selected ? " selected" : "");
    console.log(this.props.onWireCreationStart);
    console.log(this.props.onWireCreated);
    console.log(this.props.onCreatedWireDrag);
    console.log(this.props.onWireCreationEnd);
    console.log(this.props.anyTextEdited);
    return (
      <div className="node-background" style={backgroundStyle}>
        <div className={className} ref={e => (this.element = e)}>
          <NodeTextComponent
            textEditable={this.props.node.textEditable}
            editorState={this.props.node.editorState}
            onTextChange={this.props.onTextChange}
            startTextEditing={this.props.startTextEditing}
            onTextEditFinished={this.props.onTextEditFinished}
          />
          {/* <NodeResizerComponent
            node={this.props.node}
            onResizerPress={this.props.onResizerPress}
            onResize={this.props.onResize}
            onResizerRelease={this.props.onResizerRelease}
            wireCreationOn={this.props.wireCreationOn}
          /> */}
          <ConnectorsComponent
            node={this.props.node}
            onConnectorDragStart={this.props.onConnectorDragStart}
            onConnectorDrag={this.props.onConnectorDrag}
            onConnectorDragEnd={this.props.onConnectorDragEnd}
            wireCreationOn={this.props.wireCreationOn}
            dragStatus={this.props.dragStatus}
          />
          <WireCreatorComponent
            node={this.props.node}
            onWireCreationStart={this.props.onWireCreationStart}
            onWireCreated={this.props.onWireCreated}
            onCreatedWireDrag={this.props.onCreatedWireDrag}
            onWireCreationEnd={this.props.onWireCreationEnd}
            wireCreationOn={this.props.wireCreationOn}
            anyTextEdited={this.props.anyTextEdited}
            dragStatus={this.props.dragStatus}
          />
        </div>
      </div>
    );
  }

  onMouseDown = event => {
    event.preventDefault();
    if (event.button === 0) {
      this.dragInProgress = true;
      this.dragOccurred = false;
      this.mouseXAtPress = event.clientX;
      this.mouseYAtPress = event.clientY;
      this.xAtPress = this.props.node.x;
      this.yAtPress = this.props.node.y;
      this.props.onPress(event.ctrlKey || event.metaKey);
      event.stopPropagation();
    }
  };

  onMouseMove = event => {
    if (this.dragInProgress) {
      const deltaX = event.clientX - this.mouseXAtPress;
      const deltaY = event.clientY - this.mouseYAtPress;
      if (!this.thresholdExceeded) {
        this.thresholdExceeded =
          Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold;
      }
      if (this.thresholdExceeded) {
        this.props.onDrag(deltaX, deltaY, !this.dragOccurred);
        this.dragOccurred = true;
      }
    }
  };

  onMouseUp = event => this.endDrag(event.ctrlKey || event.metaKey);

  onBlur = () => this.endDrag(false);

  endDrag = shortcutDown => {
    if (this.dragInProgress) {
      this.props.onRelease(shortcutDown, this.dragOccurred);
      this.dragInProgress = false;
      this.dragOccurred = false;
      this.thresholdExceeded = false;
    }
  };

  onClick = event => {
    if (event.button === 0 && !this.props.node.textEditable) {
      this.props.onClick(event.ctrlKey || event.metaKey);
    }
  };

  // onDoubleClick = event => {
  //   if (
  //     event.button === 0 &&
  //     !this.props.node.textEditable &&
  //     !event.ctrlKey &&
  //     !event.metaKey
  //   ) {
  //     this.props.startTextEditing();
  //   }
  // };

  clamp = (value, min, max) => Math.max(min, Math.min(max, value));
}

const mapStateToProps = (state, props) => ({
  node: props.node,
  wireCreationOn: state.present.wireCreationOn,
  dragStatus: state.present.dragStatus,
  anyTextEdited: state.present.currentlyEdited > 0
});

const mapDispatchToProps = (dispatch, props) => ({
  onPress: shortcutDown => {
    if (!props.node.textEditable) {
      dispatch(finishAnyTextEditing());
    }
    handleSelectionOnPress(dispatch, props.node, shortcutDown);
    dispatch(prepareNodeDrag(props.node.id));
  },
  onDrag: (dX, dY, firstDrag) => {
    if (firstDrag) {
      dispatch(finishAnyTextEditing());
      dispatch(beginUserAction());
      // When drag is in progress the node will be mouse-transparent. So we set it on the first
      // drag rather than on press, otherwise the node wouldn't respond to double-clicks.
      dispatch(setDragStatus("node", props.node.id, -1, "inherit"));
    }
    dispatch(dragNodes(props.node.id, dX, dY));
  },
  onRelease: (shortcutDown, dragOccurred) => {
    handleSelectionOnRelease(dispatch, props.node, shortcutDown);
    dispatch(clearDragStatus());
    if (dragOccurred) {
      dispatch(completeUserAction("SELECTION_AFTER"));
    }
  },
  onClick: shortcutDown =>
    handleSelectionOnClick(dispatch, props.node, shortcutDown),
  onResizerPress: (resizeDirection, cursor) => {
    dispatch(finishAnyTextEditing());
    dispatch(beginUserAction());
    dispatch(setDragStatus(resizeDirection, props.node.id, -1, cursor));
  },
  onResize: (x, y, w, h, directions) =>
    dispatch(resizeNode(props.node.id, x, y, w, h, directions)),
  onResizerRelease: resizeOccurred => {
    dispatch(clearDragStatus());
    dispatch(
      resizeOccurred
        ? completeUserAction("ID", props.node.id)
        : discardUserAction()
    );
  },
  onConnectorDragStart: (id, start) => {
    dispatch(finishAnyTextEditing());
    dispatch(beginUserAction());
    dispatch(
      setDragStatus(start ? "wire-start" : "wire-end", id, -1, "pointer")
    );
  },
  onConnectorDrag: (id, point, start) =>
    dispatch(dragWire(id, point, start, true)),
  onConnectorDragEnd: (id, start, connectorChanged) => {
    dispatch(clearDragStatus());
    dispatch(
      connectorChanged ? completeUserAction("ID", id) : discardUserAction()
    );
  },
  onWireCreationStart: (startPos, point, startSide) => {
    dispatch(clearSelection());
    dispatch(beginUserAction());
    dispatch(addWire(props.node.id, startPos, point, startSide));
  },
  onWireCreated: id => dispatch(setDragStatus("wire-end", id, -1, "pointer")),
  onCreatedWireDrag: (id, point, allowSelfConnect) =>
    dispatch(dragWire(id, point, false, allowSelfConnect)),
  onWireCreationEnd: id => {
    dispatch(clearDragStatus());
    dispatch(completeUserAction("ID", id));
  },
  startTextEditing: () => {
    if (!props.node.textEditable) {
      dispatch(finishAnyTextEditing());
      dispatch(beginUserAction());
      dispatch(startTextEditing(props.node.id));
    }
  },
  onTextChange: editorState => {
    dispatch(onTextChange(props.node.id, editorState));
  },
  onTextEditFinished: () => dispatch(completeUserAction("ID", props.node.id))
});

export default connect(mapStateToProps, mapDispatchToProps)(NodeComponent);
