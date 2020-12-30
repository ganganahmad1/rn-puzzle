import React from 'react'
import {
  SafeAreaView,
  Text,
  FlatList,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import MaskedView from '@react-native-community/masked-view'
import Draggable from './utilities/draggable'
import jigsaw from '../assets/img'

class Puzzle extends React.Component {
  constructor(props) {
    super(props)

    this.zoneRefs = {}
    this.state = {
      jigsawPieces: [...this.props.route.params.pieces],
      pieceSize: this.props.route.params.pieceSize,
      bulgeSize: this.props.route.params.bulgeSize,
      row: this.props.route.params.row,
      zonePosition: [],
      shufflePieces: [...this.props.route.params.shufflePieces],
    }
  }

  handleDraggableRelease = (coord, value) => {
    if (
      coord.absoluteX >= this.state.zonePosition.px + value.x &&
      coord.absoluteX <=
        this.state.zonePosition.px + value.x + this.state.pieceSize &&
      coord.absoluteY >= this.state.zonePosition.py + value.y &&
      coord.absoluteY <=
        this.state.zonePosition.py + value.y + this.state.pieceSize
    ) {
      const {x, y} = this['pcs' + value.id].getLastOffset()
      const config = {
        x:
          x -
          (coord.absoluteX -
            this.state.zonePosition.px -
            coord.x -
            value.x +
            this.state.bulgeSize * value.left),
        y:
          y -
          (coord.absoluteY -
            this.state.zonePosition.py -
            coord.y -
            value.y +
            this.state.bulgeSize * value.top -
            24),
      }
      this['pcs' + value.id].setPosition(config, 'timing', {duration: 100})
    }

    // absolute x - width, absolute y - height - statusbarheight
  }

  renderDraggable = ({item}) => {
    const setRef = (ref) => (this['pcs' + item.id] = ref)
    const onRelease = (data) => this.handleDraggableRelease(data, item)

    return (
      <Draggable
        ref={setRef}
        onRelease={onRelease}
        width={
          this.state.pieceSize + this.state.bulgeSize * (item.left + item.right)
        }
        height={
          this.state.pieceSize + this.state.bulgeSize * (item.top + item.bottom)
        }
        img={item.pcsUrl}
      />
    )
  }

  keyExtractor = (item) => 'pcs-' + item.id

  setZonePosition = () => {
    // if (id + 1 === this.state.jigsawPieces.length)
    //   Object.keys(this.zoneRefs).map((item) => {
    this.zoneRef.measure((fx, fy, width, height, px, py) => {
      let zonePosition = {width, height, px, py}
      this.setState({zonePosition: zonePosition})
    })
    // })
  }

  componentDidMount() {
    setTimeout(() => {
      this.setZonePosition()
    }, 100)
  }

  renderItem = (item) => {
    return (
      <View
        key={item.id}
        collapsable={false}
        ref={(ref) => (this.zoneRefs['zone-' + item.id] = ref)}>
        <Image
          style={{
            position: 'absolute',
            width:
              this.state.pieceSize +
              this.state.bulgeSize * (item.left + item.right),
            height:
              this.state.pieceSize +
              this.state.bulgeSize * (item.top + item.bottom),
            left: item.x - this.state.bulgeSize * item.left,
            top: item.y - this.state.bulgeSize * item.top,
          }}
          source={{uri: item.zoneUrl}}
        />
      </View>
    )
  }

  render() {
    console.log(this.state.zonePosition)
    return (
      <SafeAreaView style={styles.container}>
        <View collapsable={false} ref={(ref) => (this['zoneRef'] = ref)}>
          {this.state.jigsawPieces.map((item) => this.renderItem(item))}
        </View>
        <FlatList
          keyExtractor={this.keyExtractor}
          data={this.state.shufflePieces}
          renderItem={this.renderDraggable}
          numColumns={Math.sqrt(this.state.shufflePieces.length)}
        />
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
  },
})

export default Puzzle
