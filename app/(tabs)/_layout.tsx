import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E9ECEF',
          paddingBottom: 5,
          height: 60,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={24} 
              name={focused ? 'home' : 'home-outline'} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Calendário',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={24} 
              name={focused ? 'calendar' : 'calendar-outline'} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tarefas"
        options={{
          title: 'Tarefas',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={24} 
              name={focused ? 'book' : 'book-outline'} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="despesas"
        options={{
          title: 'Despesas',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={24} 
              name={focused ? 'cash' : 'cash-outline'} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={24} 
              name={focused ? 'person' : 'person-outline'} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}