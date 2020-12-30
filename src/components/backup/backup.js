import React from 'react'
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  BackHandler,
  Alert,
} from 'react-native'
import Draggable from '../utilities/draggable'
import {ScrollView} from 'react-native-gesture-handler'
import jigsaw from '../../assets/img'
import FastImage from 'react-native-fast-image'

const Tes = (props) => {
  // useRef
  const draggableRefs = React.useRef({})
  const groupRefs = React.useRef({})
  const imgRefs = React.useRef({})
  const lineRef = React.useRef()

  // useState
  const [isDrag, setIsDrag] = React.useState({status: false, id: 999})
  const [gap, setGap] = React.useState({x: 0, y: 0})
  const [linePos, setLinePos] = React.useState([])
  const [draggablePcs, setDraggablePcs] = React.useState([])
  const [groups, setGroups] = React.useState([])
  const [shufflePieces, setShufflePieces] = React.useState(
    props.route.params.shufflePieces,
  )
  const jigsawPieces = [...props.route.params.pieces]
  const pieceSize = props.route.params.pieceSize
  const bulgeSize = props.route.params.bulgeSize
  const row = props.route.params.row

  const getLinePosition = () => {
    lineRef.current.measure((fx, fy, width, height, px, py) => {
      setLinePos({px, py})
    })
  }

  const setGapXY = (coord) => {
    setGap({x: coord.locationX, y: coord.locationY})
  }

  const renderView = (item) => {
    const width = pieceSize + bulgeSize * (item.left + item.right)
    const height = pieceSize + bulgeSize * (item.top + item.bottom)
    return (
      <View
        key={item.id}
        style={{marginHorizontal: 7}}
        onTouchMove={(e) => handleSwipe(e.nativeEvent, item.id)}>
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

  const handleSwipe = (evt, key) => {
    if (evt.pageY <= linePos.py) {
      const id = shufflePieces.findIndex((item) => item.id === key)
      const spl = shufflePieces.splice(id, 1)
      const data = Object.assign(...spl, {x: evt.pageX, y: evt.pageY})
      setDraggablePcs([...draggablePcs, data])
      setIsDrag({status: true, id: key})
    }
  }

  const renderDraggable = (item) => {
    const width = pieceSize + bulgeSize * (item.left + item.right)
    const height = pieceSize + bulgeSize * (item.top + item.bottom)
    const setRef = (ref) => (draggableRefs.current['d-' + item.id] = ref)
    const onRelease = (data) => handleDraggableRelease(data, item)

    return (
      <Draggable
        key={item.id}
        onRelease={onRelease}
        ref={setRef}
        initialX={item.x - 50}
        initialY={item.y - 50}>
        <View onTouchStart={(evt) => setGapXY(evt.nativeEvent)}>
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

  const handleDraggableRelease = (coord, value) => {
    const left = {
      position:
        value.id % row === 0
          ? 0
          : draggableRefs.current['d-' + (value.id - 1)]?.getLastOffset(),
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
          : draggableRefs.current['d-' + (value.id + 1)]?.getLastOffset(),
      leftBulge:
        (value.id + 1) % row === 0 ? 0 : jigsawPieces[value.id + 1]?.left,
      rightBulge:
        (value.id + 1) % row === 0 ? 0 : jigsawPieces[value.id + 1]?.right,
      topBulge:
        (value.id + 1) % row === 0 ? 0 : jigsawPieces[value.id + 1]?.top,
      bottomBulge:
        (value.id + 1) % row === 0 ? 0 : jigsawPieces[value.id + 1]?.bottom,
    }

    imgRefs.current['i-' + (value.id - 1)]?.measure(
      (fx, fy, width, height, px, py) => {
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

          setGroups(
            groups.map((item, key) => {
              return key === groupId
                ? Object.assign(item, {
                    group: [...item.group, ...pcs],
                  })
                : item
            }),
          )
        }
      },
    )

    imgRefs.current['i-' + (value.id + 1)]?.measure(
      (fx, fy, width, height, px, py) => {
        if (
          coord.absoluteX + bulgeSize * right?.leftBulge - 10 >=
            px - pieceSize - bulgeSize &&
          coord.absoluteX + bulgeSize * right?.leftBulge - 10 <=
            px - bulgeSize &&
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

          setGroups(
            groups.map((item, key) => {
              return key === groupId
                ? Object.assign(item, {
                    group: [...pcs, ...item.group],
                    position: position,
                  })
                : item
            }),
          )
        }
      },
    )

    if (coord.absoluteY >= linePos.py) {
      const id = draggablePcs.findIndex((item) => item.id === value.id)
      const spl = draggablePcs.splice(id, 1)
      const data = Object.assign(...spl, {x: 0, y: 0})
      setShufflePieces([...shufflePieces, data])
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

      setGroups([...groups, {group: [...pcs1, ...pcs2], position: position}])
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

      setGroups([...groups, {group: [...pcs1, ...pcs2], position: position}])
    }
  }

  const renderGroup = (draggable, key) => {
    const setRef = (ref) => (groupRefs.current['g-' + key] = ref)

    // const onPress = (data) => this.handleDraggablePressed(data, item)
    const onRelease = (data) => handleGroupRelease(data, draggable, key)

    return (
      <Draggable
        key={key}
        ref={setRef}
        initialX={draggable.position.x - 48}
        initialY={draggable.position.y - 48}
        // initialRotate={0}
        // onPress={onPress}
        onRelease={onRelease}>
        <View
          onTouchStart={(evt) => setGapXY(evt.nativeEvent)}
          style={{flexDirection: 'row'}}>
          {draggable.group.map((item) => (
            <View
              collapsable={false}
              key={item.id}
              ref={(ref) => (imgRefs.current['i-' + item.id] = ref)}>
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

  const handleGroupRelease = (coord, data, index) => {
    console.log(coord.absoluteX, gap.x)
  }

  const backAction = () => {
    Alert.alert('Hold on!', 'Are you sure you want to go back?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {text: 'YES', onPress: () => props.navigation.navigate('Index')},
    ])
    return true
  }

  React.useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backAction)

    // returned function will be called on component unmount
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction)
    }
  }, [])

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        // onTouchMove={(e) => (isDrag.status ? console.log('es') : null)}
        style={{flex: 1}}>
        {groups.map((item, key) => renderGroup(item, key))}
        {draggablePcs.map((item) => renderDraggable(item))}
      </View>
      <View style={{position: 'absolute', bottom: 0, width: '100%'}}>
        <View
          collapsable={false}
          onLayout={() => getLinePosition()}
          ref={lineRef}
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
            {shufflePieces.map((item) => renderView(item))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  draggable: {
    width: 100,
    height: 50,
    backgroundColor: '#07689f',
    justifyContent: 'center',
    alignItems: 'center',
    // position: 'absolute',
  },
  swipeable: {
    width: 100,
    height: 50,
    backgroundColor: '#07689f',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  draggableText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 17,
  },
})

export default Tes
