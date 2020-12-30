import React from 'react'
import {
  View,
  Text,
  Animated,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Easing,
} from 'react-native'
import {PanGestureHandler, State} from 'react-native-gesture-handler'

const Draggable = (props, ref) => {
  const {
    children,
    initialX,
    initialY,
    initialRotate,
    onRelease = () => {},
    onPress = () => {},
    ...gestureProps
  } = props

  const refPosition = React.useRef(undefined)

  const translate = React.useRef(new Animated.ValueXY()).current
  const lastOffset = React.useRef({
    translationX: 0,
    translationY: 0,
    absoluteX: 0,
    absoluteY: 0,
    x: 0,
    y: 0,
  }).current
  const rotateValue = React.useRef(new Animated.Value(0)).current
  const [rotate, setRotate] = React.useState(initialRotate)
  const [zInd, setZInd] = React.useState(0)

  React.useImperativeHandle(ref, () => ({
    setPosition: setPosition,
    getLastOffset: () => lastOffset,
    refPosition: refPosition.current,
    handleSetRotate: handleSetRotate,
  }))

  const setPosition = ({x, y}, animation = 'spring', opt = {}) => {
    translate.setOffset({x: 0, y: 0})
    translate.setValue({x: lastOffset.translationX, y: lastOffset.translationY})

    const config = {
      toValue: {x, y},
      useNativeDriver: true,
      overshootClamping: true,
      ...opt,
    }
    const callback = ({finished}) => {
      if (!finished) {
        return
      }

      lastOffset.translationX = x
      lastOffset.translationY = y

      translate.setOffset({
        x: lastOffset.translationX,
        y: lastOffset.translationY,
      })
      translate.setValue({x: 0, y: 0})
    }

    Animated[animation](translate, config).start(callback)
  }

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translate.x,
          translationY: translate.y,
        },
      },
    ],
    {useNativeDriver: true},
  )

  const onHandlerStateChange = (event) => {
    setZInd(99)
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastOffset.translationX += event.nativeEvent.translationX
      lastOffset.translationY += event.nativeEvent.translationY
      lastOffset.absoluteX = event.nativeEvent.absoluteX
      lastOffset.absoluteY = event.nativeEvent.absoluteY
      lastOffset.x = event.nativeEvent.x
      lastOffset.y = event.nativeEvent.y

      translate.setOffset({
        x: lastOffset.translationX,
        y: lastOffset.translationY,
      })
      translate.setValue({x: 0, y: 0})
      setZInd(0)

      onRelease && onRelease(event.nativeEvent)
    }
  }

  const handleOnPress = () => {
    onPress(rotate)
  }

  const handleSetRotate = (newRotate) => {
    setRotate(newRotate)
  }

  // React.useEffect(() => {
  //   startImageRotation()
  // }, [rotate])

  // const startImageRotation = () => {
  //   Animated.timing(rotateValue, {
  //     toValue: 1,
  //     easing: Easing.linear,
  //     useNativeDriver: true,
  //   }).start()
  // }

  // const rotation = rotateValue.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: [rotate + 'deg', rotate + 90 + 'deg'],
  // })
  return (
    <PanGestureHandler
      maxPointers={1}
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}>
      <Animated.View
        style={[
          {
            left: initialX,
            top: initialY,
            position: 'absolute',
            zIndex: zInd,
            transform: [
              {translateX: translate.x},
              {translateY: translate.y},
              // {rotate: rotation},
            ],
          },
        ]}>
        <View ref={refPosition} collapsable={false}>
          {/* <TouchableWithoutFeedback
            onPress={handleOnPress}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}> */}
          {children}
          {/* </TouchableWithoutFeedback> */}
        </View>
      </Animated.View>
    </PanGestureHandler>
  )
}

export default React.forwardRef(Draggable)
