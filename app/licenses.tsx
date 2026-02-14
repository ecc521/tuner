import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import licenses from '../assets/licenses.json';

const LicenseItem = ({ item }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <View className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.name}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">v{item.version} • {item.license}</Text>
          </View>
          <Text className="text-blue-500 dark:text-blue-400 font-medium">
             {expanded ? 'Hide' : 'View'}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="mt-4">
          {item.homepage && (
             <TouchableOpacity onPress={() => Linking.openURL(item.homepage)}>
                <Text className="text-blue-600 dark:text-blue-400 mb-2 underline">Homepage</Text>
             </TouchableOpacity>
          )}
          <View className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            <Text className="text-xs font-mono text-gray-700 dark:text-gray-300 leading-relaxed">
              {item.licenseText}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default function LicensesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900" edges={['bottom']}>
      <Stack.Screen options={{ title: 'Third-Party Licenses', headerBackTitle: 'Settings' }} />
      <FlatList
        data={licenses}
        keyExtractor={(item) => `${item.name}@${item.version}`}
        renderItem={({ item }) => <LicenseItem item={item} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </SafeAreaView>
  );
}
