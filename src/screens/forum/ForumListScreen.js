// src/screens/forum/ForumListScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { COLORS } from '../../constants/api';
import { LoadingSpinner, ErrorMessage } from '../../components/common';
import { ForumPostCard } from '../../components/cards';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

export default function ForumListScreen({ navigation }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const user = useAuthStore((state) => state.user);

    const fetchPosts = async () => {
        try {
            setError(null);
            const response = await apiClient.get('/forum');
            setPosts(response.data);
        } catch (err) {
            console.error('Forum fetch error:', err);
            setError('Konular yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPosts();
    }, []);

    if (loading && !refreshing) {
        return <LoadingSpinner message="Forum yükleniyor..." />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchPosts} />;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>💬 Forum</Text>
                {user && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('CreatePost')}
                    >
                        <Text style={styles.addButtonText}>+ Yeni Konu</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Posts List */}
            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <ForumPostCard
                        post={item}
                        onPress={() => navigation.navigate('ForumDetail', { id: item._id })}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>💬</Text>
                        <Text style={styles.emptyText}>Henüz konu açılmamış.</Text>
                        {user && (
                            <Text style={styles.emptySubtext}>İlk konuyu siz açın!</Text>
                        )}
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.gray[900],
    },
    addButton: {
        backgroundColor: COLORS.primary[500],
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.gray[500],
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.primary[500],
        marginTop: 4,
    },
});
