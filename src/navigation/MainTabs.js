// src/navigation/MainTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { COLORS } from '../constants/api';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import AdoptionListScreen from '../screens/adoption/AdoptionListScreen';
import AdoptionDetailScreen from '../screens/adoption/AdoptionDetailScreen';
import CreateAdoptionScreen from '../screens/adoption/CreateAdoptionScreen';
import LostPetListScreen from '../screens/lost/LostPetListScreen';
import LostPetDetailScreen from '../screens/lost/LostPetDetailScreen';
import ForumListScreen from '../screens/forum/ForumListScreen';
import ForumDetailScreen from '../screens/forum/ForumDetailScreen';
import CreatePostScreen from '../screens/forum/CreatePostScreen';
import MapScreen from '../screens/map/MapScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Adoption Stack
function AdoptionStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.white },
                headerTintColor: COLORS.gray[900],
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <Stack.Screen
                name="AdoptionList"
                component={AdoptionListScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AdoptionDetail"
                component={AdoptionDetailScreen}
                options={{ title: 'İlan Detayı' }}
            />
            <Stack.Screen
                name="CreateAdoption"
                component={CreateAdoptionScreen}
                options={{ title: 'Yeni İlan' }}
            />
        </Stack.Navigator>
    );
}

// Lost Pets Stack
function LostPetsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.white },
                headerTintColor: COLORS.gray[900],
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <Stack.Screen
                name="LostPetList"
                component={LostPetListScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="LostPetDetail"
                component={LostPetDetailScreen}
                options={{ title: 'Kayıp İlanı' }}
            />
        </Stack.Navigator>
    );
}

// Forum Stack
function ForumStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.white },
                headerTintColor: COLORS.gray[900],
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <Stack.Screen
                name="ForumList"
                component={ForumListScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ForumDetail"
                component={ForumDetailScreen}
                options={{ title: 'Konu' }}
            />
            <Stack.Screen
                name="CreatePost"
                component={CreatePostScreen}
                options={{ title: 'Yeni Konu' }}
            />
        </Stack.Navigator>
    );
}

// Home Stack (for navigation to details from home)
function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.white },
                headerTintColor: COLORS.gray[900],
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <Stack.Screen
                name="HomeMain"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AdoptionDetail"
                component={AdoptionDetailScreen}
                options={{ title: 'İlan Detayı' }}
            />
            <Stack.Screen
                name="LostPetDetail"
                component={LostPetDetailScreen}
                options={{ title: 'Kayıp İlanı' }}
            />
            <Stack.Screen
                name="ForumDetail"
                component={ForumDetailScreen}
                options={{ title: 'Konu' }}
            />
            <Stack.Screen
                name="LostPets"
                component={LostPetsStack}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

// Profile Stack
function ProfileStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.white },
                headerTintColor: COLORS.gray[900],
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <Stack.Screen
                name="ProfileMain"
                component={ProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AdoptionDetail"
                component={AdoptionDetailScreen}
                options={{ title: 'İlan Detayı' }}
            />
            <Stack.Screen
                name="LostPetDetail"
                component={LostPetDetailScreen}
                options={{ title: 'Kayıp İlanı' }}
            />
            <Stack.Screen
                name="ForumDetail"
                component={ForumDetailScreen}
                options={{ title: 'Konu' }}
            />
        </Stack.Navigator>
    );
}

// Tab Icon component
function TabIcon({ emoji, focused }) {
    return (
        <Text style={{ fontSize: focused ? 26 : 22 }}>
            {emoji}
        </Text>
    );
}

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    borderTopColor: COLORS.gray[200],
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: COLORS.primary[500],
                tabBarInactiveTintColor: COLORS.gray[500],
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                },
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStack}
                options={{
                    tabBarLabel: 'Ana Sayfa',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="AdoptionTab"
                component={AdoptionStack}
                options={{
                    tabBarLabel: 'Sahiplen',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🐾" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="MapTab"
                component={MapScreen}
                options={{
                    tabBarLabel: 'Harita',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="ForumTab"
                component={ForumStack}
                options={{
                    tabBarLabel: 'Forum',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="💬" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStack}
                options={{
                    tabBarLabel: 'Profil',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
}
