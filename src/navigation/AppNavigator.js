// src/navigation/AppNavigator.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
    return (
        <View style={styles.loading}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
    );
}

export default function AppNavigator() {
    const [ready, setReady] = useState(false);
    const isLoading = useAuthStore((state) => state.isLoading);
    const initAuth = useAuthStore((state) => state.initAuth);

    useEffect(() => {
        const init = async () => {
            await initAuth();
            setReady(true);
        };
        init();
    }, []);

    if (!ready || isLoading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen
                    name="Auth"
                    component={AuthStack}
                    options={{ presentation: 'modal' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#22c55e',
    },
});
