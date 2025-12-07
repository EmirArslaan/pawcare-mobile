// src/screens/forum/ForumDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { COLORS } from '../../constants/api';
import { LoadingSpinner, ErrorMessage, Button } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

export default function ForumDetailScreen({ route, navigation }) {
    const { id } = route.params;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const user = useAuthStore((state) => state.user);

    const getCategoryName = (category) => {
        switch (category) {
            case 'health': return 'Sağlık';
            case 'food': return 'Mama & Beslenme';
            case 'behavior': return 'Davranış';
            default: return 'Genel';
        }
    };

    const fetchPost = async () => {
        try {
            setError(null);
            const response = await apiClient.get(`/forum/${id}`);
            setPost(response.data);
        } catch (err) {
            console.error('Forum post error:', err);
            setError('Konu yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [id]);

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            Alert.alert('Hata', 'Lütfen bir yorum yazın.');
            return;
        }

        try {
            setSubmitting(true);
            await apiClient.post(`/forum/${id}/comments`, {
                content: newComment.trim(),
            });
            setNewComment('');
            fetchPost(); // Refresh to show new comment
        } catch (err) {
            console.error('Add comment error:', err);
            Alert.alert('Hata', 'Yorum eklenemedi.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Konu yükleniyor..." />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchPost} />;
    }

    if (!post) {
        return <ErrorMessage message="Konu bulunamadı." />;
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Post Header */}
                <View style={styles.postCard}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{getCategoryName(post.category)}</Text>
                    </View>

                    <Text style={styles.title}>{post.title}</Text>

                    <View style={styles.authorRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {post.user?.username?.[0]?.toUpperCase() || '?'}
                            </Text>
                        </View>
                        <View style={styles.authorInfo}>
                            <Text style={styles.authorName}>{post.user?.username || 'Bilinmiyor'}</Text>
                            <Text style={styles.postDate}>
                                {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.content}>{post.content}</Text>
                </View>

                {/* Comments Section */}
                <View style={styles.commentsSection}>
                    <Text style={styles.commentsTitle}>
                        💬 Yorumlar ({post.comments?.length || 0})
                    </Text>

                    {post.comments?.length === 0 ? (
                        <Text style={styles.noComments}>Henüz yorum yok. İlk yorumu siz yazın!</Text>
                    ) : (
                        post.comments.map((comment, index) => (
                            <View key={comment._id || index} style={styles.commentCard}>
                                <View style={styles.commentHeader}>
                                    <View style={styles.commentAvatar}>
                                        <Text style={styles.commentAvatarText}>
                                            {comment.user?.username?.[0]?.toUpperCase() || '?'}
                                        </Text>
                                    </View>
                                    <Text style={styles.commentAuthor}>
                                        {comment.user?.username || 'Anonim'}
                                    </Text>
                                    <Text style={styles.commentDate}>
                                        {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                                    </Text>
                                </View>
                                <Text style={styles.commentContent}>{comment.content}</Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Add Comment */}
            {user && (
                <View style={styles.addCommentContainer}>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Yorumunuzu yazın..."
                        placeholderTextColor={COLORS.gray[400]}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, submitting && styles.sendButtonDisabled]}
                        onPress={handleAddComment}
                        disabled={submitting}
                    >
                        <Text style={styles.sendButtonText}>{submitting ? '...' : '➤'}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    // Post Card
    postCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    categoryBadge: {
        backgroundColor: COLORS.accent + '20',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.accent,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.gray[900],
        marginBottom: 16,
        lineHeight: 26,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
    },
    authorInfo: {
        flex: 1,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray[900],
    },
    postDate: {
        fontSize: 12,
        color: COLORS.gray[500],
    },
    content: {
        fontSize: 15,
        color: COLORS.gray[700],
        lineHeight: 22,
    },
    // Comments
    commentsSection: {
        marginTop: 8,
    },
    commentsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.gray[900],
        marginBottom: 12,
    },
    noComments: {
        fontSize: 14,
        color: COLORS.gray[500],
        textAlign: 'center',
        paddingVertical: 24,
    },
    commentCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.secondary[500],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    commentAvatarText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.white,
    },
    commentAuthor: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.gray[800],
        flex: 1,
    },
    commentDate: {
        fontSize: 11,
        color: COLORS.gray[400],
    },
    commentContent: {
        fontSize: 14,
        color: COLORS.gray[700],
        lineHeight: 20,
    },
    // Add Comment
    addCommentContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[200],
    },
    commentInput: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        color: COLORS.gray[900],
        maxHeight: 80,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.gray[300],
    },
    sendButtonText: {
        fontSize: 18,
        color: COLORS.white,
    },
});
