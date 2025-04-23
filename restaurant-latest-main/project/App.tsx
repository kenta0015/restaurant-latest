// App.tsx または main entry ファイル

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot } from 'expo-router'; // expo-router を使用している場合

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot /> {/* これは `expo-router` が画面を自動的にレンダリングするためのコンポーネント */}
    </GestureHandlerRootView>
  );
}

