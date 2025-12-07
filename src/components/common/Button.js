// src/components/common/Button.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/api';

export default function Button({
    title,
    onPress,
    variant = 'primary', // 'primary', 'secondary', 'danger', 'outline'
    size = 'medium', // 'small', 'medium', 'large'
    disabled = false,
    loading = false,
    style,
}) {
    const getButtonStyle = () => {
        const baseStyle = [styles.button, styles[size]];

        if (disabled) {
            baseStyle.push(styles.disabled);
        } else {
            baseStyle.push(styles[variant]);
        }

        if (style) {
            baseStyle.push(style);
        }

        return baseStyle;
    };

    const getTextStyle = () => {
        if (variant === 'outline') {
            return [styles.text, styles[`${size}Text`], styles.outlineText];
        }
        return [styles.text, styles[`${size}Text`]];
    };

    return (
        <TouchableOpacity
            style={getButtonStyle()}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? COLORS.primary[500] : COLORS.white} />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Sizes
    small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    medium: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    large: {
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    // Variants
    primary: {
        backgroundColor: COLORS.primary[500],
    },
    secondary: {
        backgroundColor: COLORS.secondary[500],
    },
    danger: {
        backgroundColor: COLORS.danger,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary[500],
    },
    disabled: {
        backgroundColor: COLORS.gray[300],
    },
    // Text
    text: {
        color: COLORS.white,
        fontWeight: '600',
    },
    smallText: {
        fontSize: 12,
    },
    mediumText: {
        fontSize: 14,
    },
    largeText: {
        fontSize: 16,
    },
    outlineText: {
        color: COLORS.primary[500],
    },
});
