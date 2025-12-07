// src/components/cards/ForumPostCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/api';

export default function ForumPostCard({ post, onPress }) {
    const getCategoryName = (category) => {
        switch (category) {
            case 'health': return 'Sağlık';
            case 'food': return 'Mama & Beslenme';
            case 'behavior': return 'Davranış';
            default: return 'Genel';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.header}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{getCategoryName(post.category)}</Text>
                </View>
                <Text style={styles.commentCount}>💬 {post.comments?.length || 0}</Text>
            </View>

            <Text style={styles.title} numberOfLines={2}>{post.title}</Text>

            <View style={styles.footer}>
                <Text style={styles.author}>{post.user?.username || 'Bilinmiyor'}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: `${COLORS.accent}20`,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.accent,
    },
    commentCount: {
        fontSize: 13,
        color: COLORS.gray[500],
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.gray[900],
        marginBottom: 12,
        lineHeight: 22,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[200],
        paddingTop: 12,
    },
    author: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.gray[700],
    },
    dot: {
        marginHorizontal: 6,
        color: COLORS.gray[400],
    },
    date: {
        fontSize: 13,
        color: COLORS.gray[500],
    },
});
