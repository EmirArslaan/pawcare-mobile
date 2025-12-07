// src/components/common/LoadingSpinner.js
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/api';

export default function LoadingSpinner({ message = 'Yükleniyor...' }) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={COLORS.primary[500]} />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.gray[100],
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.primary[500],
        fontWeight: '500',
    },
});
