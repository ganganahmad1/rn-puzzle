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
  BackHandler,
  Alert,
  Dimensions,
} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import Draggable from './utilities/draggable'
import jigsaw from '../assets/img'
import FastImage from 'react-native-fast-image'

class Puzzle extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      pieceSize: this.props.route.params.pieceSize,
      bulgeSize: this.props.route.params.bulgeSize,
      row: this.props.route.params.row,
      jigsawPieces: [...this.props.route.params.pieces],
      shufflePieces: [...this.props.route.params.shufflePieces],
      draggablePcs: [],
      groups: [],
      linePos: [],
    }
  }

  getLinePosition = () => {
    this['lineRef'].measure((fx, fy, width, height, px, py) => {
      this.setState({linePos: {px, py}})
    })
  }

  renderView = (item) => {
    const {pieceSize, bulgeSize} = this.state
    const width = pieceSize + bulgeSize * (item.left + item.right)
    const height = pieceSize + bulgeSize * (item.top + item.bottom)
    return (
      <View
        key={item.id}
        style={{marginHorizontal: 7}}
        onTouchMove={(e) => this.handleSwipe(e.nativeEvent, item.id)}>
        <FastImage
          style={{width: width, height: height}}
          source={{
            uri: item.pcsUrl,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
    )
  }

  handleSwipe = (evt, key) => {
    if (evt.pageY <= this.state.linePos.py) {
      const id = this.state.shufflePieces.findIndex((item) => item.id === key)
      const spl = this.state.shufflePieces.splice(id, 1)
      const data = Object.assign(...spl, {x: evt.pageX, y: evt.pageY})
      this.setState({draggablePcs: [...this.state.draggablePcs, data]})
    }
  }

  renderDraggable = (item) => {
    const {pieceSize, bulgeSize} = this.state
    const width = pieceSize + bulgeSize * (item.left + item.right)
    const height = pieceSize + bulgeSize * (item.top + item.bottom)
    const setRef = (ref) => (this['d-' + item.id] = ref)
    const onRelease = (data) => this.handleDraggableRelease(data, item)

    return (
      <Draggable
        key={item.id}
        onRelease={onRelease}
        ref={setRef}
        initialX={item.x - 50}
        initialY={item.y - 50}>
        <View onTouchStart={(evt) => console.log(evt.nativeEvent)}>
          <FastImage
            style={{width: width, height: height}}
            source={{
              uri: item.pcsUrl,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      </Draggable>
    )
  }

  handleDraggableRelease = (coord, value) => {
    const {
      jigsawPieces,
      pieceSize,
      bulgeSize,
      draggablePcs,
      linePos,
      row,
      groups,
      shufflePieces,
    } = this.state

    const left = {
      position:
        value.id % row === 0 ? 0 : this['d-' + (value.id - 1)]?.getLastOffset(),
      leftBulge: value.id % row === 0 ? 0 : jigsawPieces[value.id - 1]?.left,
      rightBulge: value.id % row === 0 ? 0 : jigsawPieces[value.id - 1]?.right,
      topBulge: value.id % row === 0 ? 0 : jigsawPieces[value.id - 1]?.top,
      bottomBulge:
        value.id % row === 0 ? 0 : jigsawPieces[value.id - 1]?.bottom,
    }
    const right = {
      position:
        (value.id + 1) % row === 0
          ? 0
          : this['d-' + (value.id + 1)]?.getLastOffset(),
      leftBulge:
        (value.id + 1) % row === 0 ? 0 : jigsawPieces[value.id + 1]?.left,
      rightBulge:
        (value.id + 1) % row === 0 ? 0 : jigsawPieces[value.id + 1]?.right,
      topBulge:
        (value.id + 1) % row === 0 ? 0 : jigsawPieces[value.id + 1]?.top,
      bottomBulge:
        (value.id + 1) % row === 0 ? 0 : jigsawPieces[value.id + 1]?.bottom,
    }

    this['i-' + (value.id - 1)]?.measure((fx, fy, width, height, px, py) => {
      if (
        coord.absoluteX - bulgeSize * left.rightBulge >=
          px + pieceSize - bulgeSize + 10 &&
        coord.absoluteX - bulgeSize * left.rightBulge <=
          px + pieceSize + bulgeSize + 10 &&
        coord.absoluteY +
          bulgeSize * (right.bottomBulge || jigsawPieces[value.id].bottom) >=
          py + bulgeSize * 2 &&
        coord.absoluteY +
          bulgeSize * (right.bottomBulge || jigsawPieces[value.id].bottom) <=
          py + pieceSize + bulgeSize + 10
      ) {
        let groupId = null
        groups.map((item, key) => {
          item.group.map((i) => {
            if (i.id === value.id - 1) groupId = key
          })
        })
        let pcsId = draggablePcs.findIndex((item) => item.id === value.id)
        let pcs = draggablePcs.splice(pcsId, 1)

        this.setState({
          groups: groups.map((item, key) => {
            return key === groupId
              ? Object.assign(item, {
                  group: [...item.group, ...pcs],
                })
              : item
          }),
        })
      }
    })

    this['i-' + (value.id + 1)]?.measure((fx, fy, width, height, px, py) => {
      if (
        coord.absoluteX + bulgeSize * right?.leftBulge - 10 >=
          px - pieceSize - bulgeSize &&
        coord.absoluteX + bulgeSize * right?.leftBulge - 10 <= px - bulgeSize &&
        coord.absoluteY +
          bulgeSize * (right.bottomBulge || jigsawPieces[value.id].bottom) >=
          py + bulgeSize * 2 &&
        coord.absoluteY +
          bulgeSize * (right.bottomBulge || jigsawPieces[value.id].bottom) <=
          py + pieceSize + bulgeSize + 10
      ) {
        let groupId = null
        groups.map((item, key) => {
          item.group.map((i) => {
            if (i.id === value.id + 1) groupId = key
          })
        })
        let pcsId = draggablePcs.findIndex((item) => item.id === value.id)
        let pcs = draggablePcs.splice(pcsId, 1)
        const position = {x: coord.absoluteX, y: coord.absoluteY}

        this.setState({
          groups: groups.map((item, key) => {
            return key === groupId
              ? Object.assign(item, {
                  group: [...pcs, ...item.group],
                  position: position,
                })
              : item
          }),
        })
      }
    })

    if (coord.absoluteY >= linePos.py) {
      const id = draggablePcs.findIndex((item) => item.id === value.id)
      const spl = draggablePcs.splice(id, 1)
      const data = Object.assign(...spl, {x: 0, y: 0})

      this.setState({shufflePieces: [...shufflePieces, data]})
    } else if (
      coord.absoluteX + bulgeSize * right?.leftBulge >=
        right.position?.absoluteX - pieceSize - bulgeSize &&
      coord.absoluteX + bulgeSize * right?.leftBulge <=
        right.position?.absoluteX &&
      coord.absoluteY +
        bulgeSize * (right?.bottomBulge || jigsawPieces[value.id]?.bottom) >=
        right.position?.absoluteY + bulgeSize &&
      coord.absoluteY +
        bulgeSize * (right?.bottomBulge || jigsawPieces[value.id]?.bottom) <=
        right.position?.absoluteY + pieceSize - bulgeSize
    ) {
      const id2 = draggablePcs.findIndex((item) => item.id === value.id + 1)
      const pcs2 = draggablePcs.splice(id2, 1)
      const id1 = draggablePcs.findIndex((item) => item.id === value.id)
      const pcs1 = draggablePcs.splice(id1, 1)
      const position = {x: coord.absoluteX, y: coord.absoluteY}

      this.setState({
        groups: [...groups, {group: [...pcs1, ...pcs2], position: position}],
      })
    } else if (
      coord.absoluteX - bulgeSize * left?.rightBulge >=
        left.position?.absoluteX + pieceSize - bulgeSize &&
      coord.absoluteX - bulgeSize * left?.rightBulge <=
        left.position?.absoluteX + pieceSize + bulgeSize &&
      coord.absoluteY +
        bulgeSize * (left?.bottomBulge || jigsawPieces[value.id]?.bottom) >=
        left.position?.absoluteY + bulgeSize &&
      coord.absoluteY +
        bulgeSize * (left?.bottomBulge || jigsawPieces[value.id]?.bottom) <=
        left.position?.absoluteY + pieceSize - bulgeSize
    ) {
      const id2 = draggablePcs.findIndex((item) => item.id === value.id)
      const pcs2 = draggablePcs.splice(id2, 1)
      const id1 = draggablePcs.findIndex((item) => item.id === value.id - 1)
      const pcs1 = draggablePcs.splice(id1, 1)
      const position = {x: left.position.absoluteX, y: left.position.absoluteY}

      this.setState({
        groups: [...groups, {group: [...pcs1, ...pcs2], position: position}],
      })
    }
  }

  renderGroup = (draggable, key) => {
    const {bulgeSize, pieceSize, jigsawPieces} = this.state
    const setRef = (ref) => (this['g-' + key] = ref)
    // const onPress = (data) => this.handleDraggablePressed(data, item)
    const onRelease = (data) => this.handleGroupRelease(data, draggable, key)

    return (
      <Draggable
        key={key}
        ref={setRef}
        initialX={draggable.position.x - 48}
        initialY={draggable.position.y - 48}
        // initialRotate={0}
        // onPress={onPress}
        onRelease={onRelease}>
        <View style={{flexDirection: 'row'}}>
          {draggable.group.map((item) => (
            <View
              collapsable={false}
              key={item.id}
              ref={(ref) => (this['i-' + item.id] = ref)}>
              <FastImage
                style={{
                  left:
                    -bulgeSize *
                    item.id *
                    (jigsawPieces[item.id - 1]?.right || item.left),
                  // top: item.y - item.top * bulgeSize,
                  width: pieceSize + bulgeSize * (item.left + item.right),
                  height: pieceSize + bulgeSize * (item.top + item.bottom),
                }}
                source={{
                  uri: item.pcsUrl,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          ))}
        </View>
      </Draggable>
    )
  }

  handleGroupRelease = (coord, data, index) => {
    this['i-' + 0]?.measure((fx, fy, width, height, px, py) => {
      console.log(fx, fy, width, height, px, py)
    })
  }

  backAction = () => {
    Alert.alert('Hold on!', 'Are you sure you want to go back?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {text: 'YES', onPress: () => this.props.navigation.navigate('Index')},
    ])
    return true
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backAction)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction)
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1}}>
          <View
            style={{
              width: 200,
              height: 200,
              backgroundColor: 'red',
              margin: 50,
            }}
            onTouchStart={(evt) => console.log(evt.nativeEvent)}
          />
          {this.state.groups.map((item, key) => this.renderGroup(item, key))}
          {this.state.draggablePcs.map((item) => this.renderDraggable(item))}
        </View>
        <View style={{position: 'absolute', bottom: 0, width: '100%'}}>
          <View
            collapsable={false}
            onLayout={() => this.getLinePosition()}
            ref={(ref) => (this['lineRef'] = ref)}
            style={{borderTopWidth: 2}}
          />
          <ScrollView
            horizontal={true}
            style={{
              backgroundColor: '#fff',
            }}>
            <View
              style={{
                paddingVertical: 15,
                flexDirection: 'row',
              }}>
              {this.state.shufflePieces.map((item) => this.renderView(item))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    )
  }
}

export default Puzzle
