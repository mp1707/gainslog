    import { useState } from "react";
    import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StyleSheet,
    } from "react-native";
    import * as ImagePicker from "expo-image-picker";
    import { supabase } from "../lib/supabase";

    export const ImageUpload = () => {
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pickImage = async () => {
        try {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setError(null);
        }
        } catch (err) {
        setError("Failed to pick image");
        console.error("Error picking image:", err);
        }
    };

    const uploadImage = async () => {
        if (!image) return;

        try {
        setUploading(true);
        setError(null);

        // Convert image uri to blob
        const response = await fetch(image);
        const blob = await response.blob();

        // Generate a unique filename
        const filename = `public/image-${Date.now()}.jpg`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from("food-images")
            .upload(filename, blob);

        if (uploadError) {
            throw uploadError;
        }

        // Clear the selected image after successful upload
        setImage(null);
        } catch (err) {
        setError("Failed to upload image");
        console.error("Error uploading image:", err);
        } finally {
        setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
        <TouchableOpacity
            style={styles.pickButton}
            onPress={pickImage}
            disabled={uploading}
        >
            <Text style={styles.buttonText}>Pick an Image</Text>
        </TouchableOpacity>

        {image && (
            <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
                style={styles.uploadButton}
                onPress={uploadImage}
                disabled={uploading}
            >
                {uploading ? (
                <ActivityIndicator color="#ffffff" />
                ) : (
                <Text style={styles.buttonText}>Upload Image</Text>
                )}
            </TouchableOpacity>
            </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
    };

    const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: "center",
    },
    pickButton: {
        backgroundColor: "#0ea5e9",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    uploadButton: {
        backgroundColor: "#10b981",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    imageContainer: {
        alignItems: "center",
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 8,
    },
    errorText: {
        color: "#ef4444",
        marginTop: 10,
    },
    });
