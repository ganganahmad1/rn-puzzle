import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import {NavigationContainer} from '@react-navigation/native'

import Index from '../../components/'
import SliceTo25 from '../../components/cropper/5x5'
import SliceTo36 from '../../components/cropper/6x6'
import Puzzle from '../../components/tes'

const Stack = createStackNavigator()

const MainNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen
          name="Index"
          component={Index}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SliceTo36"
          component={SliceTo36}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SliceTo25"
          component={SliceTo25}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Puzzle"
          component={Puzzle}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default MainNavigation
