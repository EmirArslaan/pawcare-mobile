// src/screens/forum/CreatePostScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { COLORS } from '../../constants/api';
import { Button } from '../../components/common';
import apiClient from '../../api/client';

export default function CreatePostScreen({ navigation }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general',
    });
    const [loading, setLoading] = useState(false);

    const categories = [
        { key: 'general', label: 'Genel', emoji: '💭' },
        { key: 'health', label: 'Sağlık', emoji: '🏥' },
        { key: 'food', label: 'Mama & Beslenme', emoji: '🍖' },
        { key: 'behavior', label: 'Davranış', emoji: '🐾' },
    ];

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            Alert.alert('Hata', 'Lütfen başlık ve içerik alanlarını doldurun.');
            return;
        }

        try {
            setLoading(true);
            await apiClient.post('/forum', formData);
            Alert.alert('Başarılı', 'Konunuz oluşturuldu!', [
                { text: 'Tamam', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error('Create post error:', error);
            Alert.alert('Hata', 'Konu oluşturulamadı. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.pageTitle}>Yeni Konu Aç</Text>

            {/* Category */}
            <View style={styles.section}>
                <Text style={styles.label}>Kategori</Text>
                <View style={styles.categoryButtons}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.key}
                            style={[
                                styles.categoryButton,
                                formData.category === cat.key && styles.categoryButtonActive,
                            ]}
                            onPress={() => setFormData({ ...formData, category: cat.key })}
                        >
                            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                            <Text
                                style={[
                                    styles.categoryLabel,
                                    formData.category === cat.key && styles.categoryLabelActive,
                                ]}
                            >
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Title */}
            <View style={styles.section}>
                <Text style={styles.label}>Başlık *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Konunuzun başlığını yazın..."
                    placeholderTextColor={COLORS.gray[400]}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    maxLength={100}
                />
                <Text style={styles.charCount}>{formData.title.length}/100</Text>
            </View>

            {/* Content */}
            <View style={styles.section}>
                <Text style={styles.label}>İçerik *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Konunuzu detaylı şekilde açıklayın..."
                    placeholderTextColor={COLORS.gray[400]}
                    value={formData.content}
                    onChangeText={(text) => setFormData({ ...formData, content: text })}
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                    maxLength={2000}
                />
                <Text style={styles.charCount}>{formData.content.length}/2000</Text>
            </View>

            {/* Submit */}
            <Button
                title="Konuyu Paylaş"
                onPress={handleSubmit}
                loading={loading}
                size="large"
                style={{ marginTop: 8, marginBottom: 24 }}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
    },
    scrollContent: {
        padding: 16,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.gray[900],
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray[700],
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: COLORS.gray[900],
    },
    textArea: {
        height: 160,
        paddingTop: 12,
    },
    charCount: {
        fontSize: 12,
        color: COLORS.gray[400],
        textAlign: 'right',
        marginTop: 4,
    },
    // Category
    categoryButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    categoryButtonActive: {
        backgroundColor: COLORS.primary[50],
        borderColor: COLORS.primary[500],
    },
    categoryEmoji: {
        fontSize: 14,
        marginRight: 6,
    },
    categoryLabel: {
        fontSize: 13,
        color: COLORS.gray[700],
    },
    categoryLabelActive: {
        color: COLORS.primary[600],
        fontWeight: '600',
    },
});
