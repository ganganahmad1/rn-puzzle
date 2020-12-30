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
import Draggable from './utilities/draggable'
import {ScrollView} from 'react-native-gesture-handler'
import jigsaw from '../assets/img/'
import FastImage from 'react-native-fast-image'
import toAlpha from './numToAlpha'

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
        <View
          collapsable={false}
          ref={(ref) => (imgRefs.current['s-' + item.id] = ref)}
          onTouchStart={(evt) => setGapXY(evt.nativeEvent)}>
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
        draggableRefs.current['d-' + (value.id - 1)]?.getLastOffset() || 0,
      leftBulge: jigsawPieces[value.id - 1]?.left || 0,
      rightBulge: jigsawPieces[value.id - 1]?.right || 0,
      topBulge: jigsawPieces[value.id - 1]?.top || 0,
      bottomBulge:
        jigsawPieces[value.id - 1]?.bottom || jigsawPieces[value.id].bottom,
    }
    const right = {
      position:
        draggableRefs.current['d-' + (value.id + 1)]?.getLastOffset() || 0,
      leftBulge: jigsawPieces[value.id + 1]?.left || 0,
      rightBulge: jigsawPieces[value.id + 1]?.right || 0,
      topBulge: jigsawPieces[value.id + 1]?.top || 0,
      bottomBulge:
        jigsawPieces[value.id + 1]?.bottom || jigsawPieces[value.id].bottom,
    }
    const top = {
      position:
        draggableRefs.current['d-' + (value.id - 5)]?.getLastOffset() || 0,
      leftBulge: jigsawPieces[value.id - 5]?.left || 0,
      rightBulge:
        jigsawPieces[value.id - 5]?.right || jigsawPieces[value.id].right,
      topBulge: jigsawPieces[value.id - 5]?.top || 0,
      bottomBulge: jigsawPieces[value.id - 5]?.bottom || 0,
    }
    const bottom = {
      position:
        draggableRefs.current['d-' + (value.id + 5)]?.getLastOffset() || 0,
      leftBulge: jigsawPieces[value.id + 5]?.left || 0,
      rightBulge:
        jigsawPieces[value.id + 5]?.right || jigsawPieces[value.id].right,
      topBulge: jigsawPieces[value.id + 5]?.top || 0,
      bottomBulge: jigsawPieces[value.id + 5]?.bottom || 0,
    }

    imgRefs.current['s-' + (value.id - row)]?.measure(
      (fx, fy, width, height, px, py) => {
        if (
          coord.absoluteX >= px &&
          coord.absoluteX <= px + pieceSize &&
          coord.absoluteY >= py + pieceSize &&
          coord.absoluteY <=
            py + pieceSize * 2 - bulgeSize * jigsawPieces[value.id].top
        ) {
          const {group} = handleMergeItem(value.id, value.id - row, 'vertical')
          const position = {
            x: top.position.absoluteX,
            y: top.position.absoluteY,
          }

          setGroups([...groups, {group: group, position: position}])
        }
      },
    )

    imgRefs.current['s-' + (value.id + row)]?.measure(
      (fx, fy, width, height, px, py) => {
        if (
          coord.absoluteX >= px &&
          coord.absoluteX <= px + pieceSize &&
          coord.absoluteY >=
            py - pieceSize + bulgeSize * jigsawPieces[value.id].bottom &&
          coord.absoluteY <= py + bulgeSize
        ) {
          const {group} = handleMergeItem(value.id, value.id + row, 'vertical')
          const position = {
            x: coord.absoluteX,
            y: coord.absoluteY,
          }

          setGroups([...groups, {group: group, position: position}])
        }
      },
    )

    imgRefs.current['s-' + (value.id - 1)]?.measure(
      (fx, fy, width, height, px, py) => {
        if (
          coord.absoluteX >= px + pieceSize - bulgeSize &&
          coord.absoluteX <=
            px + pieceSize * 2 - bulgeSize * jigsawPieces[value.id].left &&
          coord.absoluteY + bulgeSize * right.bottomBulge >=
            py + bulgeSize * 2 &&
          coord.absoluteY + bulgeSize * right.bottomBulge <=
            py + pieceSize + bulgeSize + 10
        ) {
          const {group} = handleMergeItem(value.id, value.id - 1, 'horizontal')
          const position = {
            x: left.position.absoluteX,
            y: left.position.absoluteY,
          }

          setGroups([...groups, {group: group, position: position}])
        }
      },
    )

    imgRefs.current['s-' + (value.id + 1)]?.measure(
      (fx, fy, width, height, px, py) => {
        if (
          coord.absoluteX >=
            px - pieceSize + bulgeSize * jigsawPieces[value.id].right &&
          coord.absoluteX + bulgeSize * right.leftBulge <= px + bulgeSize &&
          coord.absoluteY + bulgeSize * right.bottomBulge >=
            py + bulgeSize * 2 &&
          coord.absoluteY + bulgeSize * right.bottomBulge <=
            py + pieceSize + bulgeSize + 10
        ) {
          const {group} = handleMergeItem(value.id, value.id + 1, 'horizontal')
          const position = {x: coord.absoluteX, y: coord.absoluteY}

          setGroups([...groups, {group: group, position: position}])
        }
      },
    )

    imgRefs.current['i-' + (value.id - row)]?.measure(
      (fx, fy, width, height, px, py) => {
        if (
          coord.absoluteX >= px &&
          coord.absoluteX <= px + pieceSize &&
          coord.absoluteY >= py + pieceSize &&
          coord.absoluteY <=
            py + pieceSize * 2 - bulgeSize * jigsawPieces[value.id].top
        ) {
          const {group, groupId} = handleMergeItem(
            value.id,
            value.id - row,
            'group',
          )

          // setGroups(
          //   groups.map((item, key) => {
          //     return key === groupId
          //       ? Object.assign(item, {group: group})
          //       : item
          //   }),
          // )
          // console.log(group, groups)
        }
      },
    )

    imgRefs.current['i-' + (value.id + row)]?.measure(
      (fx, fy, width, height, px, py) => {
        if (
          coord.absoluteX >= px &&
          coord.absoluteX <= px + pieceSize &&
          coord.absoluteY >=
            py - pieceSize + bulgeSize * jigsawPieces[value.id].bottom &&
          coord.absoluteY <= py + bulgeSize
        ) {
          const {group, groupId} = handleMergeItem(
            value.id,
            value.id + row,
            'group',
          )

          // setGroups(group)

          // console.log('plus')
        }
      },
    )

    imgRefs.current['i-' + (value.id - 1)]?.measure(
      (fx, fy, width, height, px, py) => {
        if (
          coord.absoluteX >= px + pieceSize - bulgeSize &&
          coord.absoluteX <=
            px + pieceSize * 2 - bulgeSize * jigsawPieces[value.id].left &&
          coord.absoluteY + bulgeSize * right.bottomBulge >=
            py + bulgeSize * 2 &&
          coord.absoluteY + bulgeSize * right.bottomBulge <=
            py + pieceSize + bulgeSize + 10
        ) {
          const {group, groupId} = handleMergeItem(
            value.id,
            value.id - 1,
            'group',
          )

          setGroups(group)
        }
      },
    )

    imgRefs.current['i-' + (value.id + 1)]?.measure(
      (fx, fy, width, height, px, py) => {
        if (
          coord.absoluteX >=
            px - pieceSize + bulgeSize * jigsawPieces[value.id].right &&
          coord.absoluteX + bulgeSize * right.leftBulge <= px + bulgeSize &&
          coord.absoluteY + bulgeSize * right.bottomBulge >=
            py + bulgeSize * 2 &&
          coord.absoluteY + bulgeSize * right.bottomBulge <=
            py + pieceSize + bulgeSize + 10
        ) {
          const {group, groupId} = handleMergeItem(
            value.id,
            value.id + 1,
            'group',
          )

          setGroups(group)
        }
      },
    )

    if (coord.absoluteY >= linePos.py) {
      const id = draggablePcs.findIndex((item) => item.id === value.id)
      const spl = draggablePcs.splice(id, 1)
      const data = Object.assign(...spl, {x: 0, y: 0})
      setShufflePieces([...shufflePieces, data])
      // } else if (
      //   coord.absoluteX + bulgeSize * right.leftBulge >=
      //     right.position.absoluteX - pieceSize - bulgeSize &&
      //   coord.absoluteX + bulgeSize * right.leftBulge <=
      //     right.position.absoluteX &&
      //   coord.absoluteY + bulgeSize * right.bottomBulge >=
      //     right.position.absoluteY + bulgeSize &&
      //   coord.absoluteY + bulgeSize * right.bottomBulge <=
      //     right.position.absoluteY + pieceSize - bulgeSize
      // ) {
      //   const id2 = draggablePcs.findIndex((item) => item.id === value.id + 1)
      //   const pcs2 = draggablePcs.splice(id2, 1)
      //   const id1 = draggablePcs.findIndex((item) => item.id === value.id)
      //   const pcs1 = draggablePcs.splice(id1, 1)
      //   const position = {x: coord.absoluteX, y: coord.absoluteY}

      //   setGroups([...groups, {group: [...pcs1, ...pcs2], position: position}])
      // } else if (
      //   coord.absoluteX - bulgeSize * left.rightBulge >=
      //     left.position.absoluteX + pieceSize - bulgeSize &&
      //   coord.absoluteX - bulgeSize * left.rightBulge <=
      //     left.position.absoluteX + pieceSize + bulgeSize &&
      //   coord.absoluteY + bulgeSize * left.bottomBulge >=
      //     left.position.absoluteY + bulgeSize &&
      //   coord.absoluteY + bulgeSize * left.bottomBulge <=
      //     left.position.absoluteY + pieceSize - bulgeSize
      // ) {
      // const id2 = draggablePcs.findIndex((item) => item.id === value.id)
      // const pcs2 = draggablePcs.splice(id2, 1)
      // const id1 = draggablePcs.findIndex((item) => item.id === value.id - 1)
      // const pcs1 = draggablePcs.splice(id1, 1)
      // const position = {x: left.position.absoluteX, y: left.position.absoluteY}

      // setGroups([...groups, {group: [...pcs1, ...pcs2], position: position}])
    }
  }

  const handleMergeItem = (key1, key2, type) => {
    let group = Array.from(Array(row), (_) => Array(row))
    let groupId = null

    if (type === 'vertical') {
      const id1 = draggablePcs.findIndex((item) => item.id === key1)
      const pcs1 = draggablePcs.splice(id1, 1)
      // let arr1 = Array(row)
      // arr1[pcs1[0].hor] = pcs1[0]
      group[pcs1[0].ver][pcs1[0].hor] = pcs1[0]

      const id2 = draggablePcs.findIndex((item) => item.id === key2)
      const pcs2 = draggablePcs.splice(id2, 1)
      // let arr2 = Array(row)
      // arr2[pcs2[0].hor] = pcs2[0]
      group[pcs2[0].ver][pcs2[0].hor] = pcs2[0]
    } else if (type === 'horizontal') {
      let arr = Array(row)
      const id1 = draggablePcs.findIndex((item) => item.id === key1)
      const pcs1 = draggablePcs.splice(id1, 1)
      arr[pcs1[0].hor] = pcs1[0]

      const id2 = draggablePcs.findIndex((item) => item.id === key2)
      const pcs2 = draggablePcs.splice(id2, 1)
      arr[pcs2[0].hor] = pcs2[0]

      group[pcs1[0].ver] = arr
    } else {
      group = [...groups]
      groups.map((item, key) => {
        item.group.map((i, k) => {
          i.map((t, s) => {
            if (t.id === key2) groupId = key
          })
        })
      })

      const id = draggablePcs.findIndex((item) => item.id === key1)
      const pcs = draggablePcs.splice(id, 1)

      group[groupId].group[pcs[0].ver][pcs[0].hor] = pcs[0]
    }

    return {group, groupId}
  }

  const renderG = (arr, groupId) => {
    const setRef = (ref) => (groupRefs.current['g-' + groupId] = ref)
    const onRelease = (data) => handleGroupRelease(data, arr, groupId)
    // const onPress = (data) => this.handleDraggablePressed(data, item)
    return (
      <Draggable
        key={groupId}
        ref={setRef}
        initialX={arr.position.x - 48}
        initialY={arr.position.y - 48}
        // initialRotate={0}
        // onPress={onPress}
        onRelease={onRelease}>
        {arr.group.map((i, k) => {
          return (
            <View key={k} style={{flexDirection: 'row'}}>
              {i.map((item, key) => {
                const width = pieceSize + bulgeSize * (item.left + item.right)
                const height = pieceSize + bulgeSize * (item.top + item.bottom)

                console.log(arr.group[k][key])

                return (
                  <View
                    collapsable={false}
                    key={item.id}
                    style={{
                      left:
                        -bulgeSize *
                        (jigsawPieces[item.id - 1]?.right || item.left) *
                        item.hor,
                      top:
                        -bulgeSize *
                        item.ver *
                        (jigsawPieces[item.id - row]?.bottom || item.top),
                    }}
                    ref={(ref) => (imgRefs.current['i-' + item.id] = ref)}>
                    <FastImage
                      style={{
                        width: width,
                        height: height,
                      }}
                      source={{
                        uri: item.pcsUrl,
                        priority: FastImage.priority.normal,
                      }}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  </View>
                )
              })}
            </View>
          )
        })}
      </Draggable>
    )
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
          style={{
            flexDirection: 'row',
          }}>
          {draggable.group.map((item, key) => (
            <View
              collapsable={false}
              key={item.id}
              style={{
                top: 0,
                left:
                  -bulgeSize *
                  key *
                  (jigsawPieces[item.id - 1]?.right || item.left),
                top: -bulgeSize * item.top,
              }}
              ref={(ref) => (imgRefs.current['i-' + item.id] = ref)}>
              <FastImage
                style={{
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
    // const group = {
    //   start: data.group[0].id,
    //   end: data.group[data.group.length - 1].id,
    // }
    // const left = {
    //   position:
    //     draggableRefs.current['d-' + (group.start - 1)]?.getLastOffset() || 0,
    //   leftBulge: jigsawPieces[group.start - 1]?.left || 0,
    //   rightBulge: jigsawPieces[group.start - 1]?.right || 0,
    //   topBulge: jigsawPieces[group.start - 1]?.top || 0,
    //   bottomBulge:
    //     jigsawPieces[group.start - 1]?.bottom ||
    //     jigsawPieces[group.start].bottom,
    // }
    // const right = {
    //   position:
    //     draggableRefs.current['d-' + (group.end + 1)]?.getLastOffset() || 0,
    //   leftBulge: jigsawPieces[group.end + 1]?.left || 0,
    //   rightBulge: jigsawPieces[group.end + 1]?.right || 0,
    //   topBulge: jigsawPieces[group.end + 1]?.top || 0,
    //   bottomBulge:
    //     jigsawPieces[group.end + 1]?.bottom || jigsawPieces[group.end].bottom,
    // }
    // imgRefs.current['i-' + (group.start - 1)]?.measure(
    //   (fx, fy, width, height, px, py) => {
    //     if (
    //       coord.absoluteX - bulgeSize * left.rightBulge >=
    //         px + pieceSize - bulgeSize + 10 &&
    //       coord.absoluteX - bulgeSize * left.rightBulge <=
    //         px + pieceSize + bulgeSize + 10 &&
    //       coord.absoluteY + bulgeSize * right.bottomBulge >=
    //         py + bulgeSize * 2 &&
    //       coord.absoluteY + bulgeSize * right.bottomBulge <=
    //         py + pieceSize + bulgeSize + 10
    //     ) {
    //       let groupId = null
    //       groups.map((item, key) => {
    //         item.group.map((i) => {
    //           if (i.id === group.start - 1) groupId = key
    //         })
    //       })
    //       let pcs = data.group.splice(0, data.group.length)
    //       setGroups(
    //         groups.map((item, key) => {
    //           return key === groupId
    //             ? Object.assign(item, {
    //                 group: [...item.group, ...pcs],
    //               })
    //             : item
    //         }),
    //       )
    //     }
    //   },
    // )
    // imgRefs.current['i-' + (group.end + 1)]?.measure(
    //   (fx, fy, width, height, px, py) => {
    //     if (
    //       coord.absoluteX + bulgeSize * right.leftBulge - 10 >=
    //         px - pieceSize - bulgeSize &&
    //       coord.absoluteX + bulgeSize * right.leftBulge - 10 <=
    //         px - bulgeSize &&
    //       coord.absoluteY + bulgeSize * right.bottomBulge >=
    //         py + bulgeSize * 2 &&
    //       coord.absoluteY + bulgeSize * right.bottomBulge <=
    //         py + pieceSize + bulgeSize + 10
    //     ) {
    //       let groupId = null
    //       groups.map((item, key) => {
    //         item.group.map((i) => {
    //           if (i.id === group.end + 1) groupId = key
    //         })
    //       })
    //       let pcs = groups[groupId].group.splice(
    //         0,
    //         groups[groupId].group.length,
    //       )
    //       setGroups(
    //         groups.map((item, key) => {
    //           return key === index
    //             ? Object.assign(item, {
    //                 group: [...item.group, ...pcs],
    //               })
    //             : item
    //         }),
    //       )
    //     }
    //   },
    // )
    // if (
    //   coord.absoluteX + bulgeSize * right.leftBulge >=
    //     right.position.absoluteX - pieceSize - bulgeSize &&
    //   coord.absoluteX + bulgeSize * right.leftBulge <=
    //     right.position.absoluteX &&
    //   coord.absoluteY + bulgeSize * right.bottomBulge >=
    //     right.position.absoluteY + bulgeSize &&
    //   coord.absoluteY + bulgeSize * right.bottomBulge <=
    //     right.position.absoluteY + pieceSize - bulgeSize
    // ) {
    //   let pcsId = draggablePcs.findIndex((item) => item.id === group.end + 1)
    //   let pcs = draggablePcs.splice(pcsId, 1)
    //   setGroups(
    //     groups.map((item, key) => {
    //       return key === index
    //         ? Object.assign(item, {
    //             group: [...item.group, ...pcs],
    //           })
    //         : item
    //     }),
    //   )
    // } else if (
    //   coord.absoluteX - bulgeSize * left.rightBulge >=
    //     left.position.absoluteX + pieceSize - bulgeSize &&
    //   coord.absoluteX - bulgeSize * left.rightBulge <=
    //     left.position.absoluteX + pieceSize + bulgeSize &&
    //   coord.absoluteY + bulgeSize * left.bottomBulge >=
    //     left.position.absoluteY + bulgeSize &&
    //   coord.absoluteY + bulgeSize * left.bottomBulge <=
    //     left.position.absoluteY + pieceSize - bulgeSize
    // ) {
    //   let pcsId = draggablePcs.findIndex((item) => item.id === group.start - 1)
    //   let pcs = draggablePcs.splice(pcsId, 1)
    //   const position = {x: left.position.absoluteX, y: left.position.absoluteY}
    //   setGroups(
    //     groups.map((item, key) => {
    //       return key === index
    //         ? Object.assign(item, {
    //             group: [...pcs, ...item.group],
    //             position: position,
    //           })
    //         : item
    //     }),
    //   )
    // }
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

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction)
    }
  }, [])

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        // onTouchMove={(e) => (isDrag.status ? console.log('es') : null)}
        style={{flex: 1}}>
        {groups.map((item, key) => renderG(item, key))}
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

// kelana coffee
// lakamera
// skema coffee
// satu pintu, 911
// chapter one
// delasol
// tabuga city view
