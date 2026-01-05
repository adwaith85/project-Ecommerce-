import React, { useEffect, useState, useRef } from 'react';
import './Profile.css';
import Navbar from '../components/Navbar';
import AuthStore from '../AuthStore';
import api from '../Axios/Script';

function Profile() {
    const [user, setUser] = useState({});
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        number: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const { token } = AuthStore();

    const getData = async () => {
        if (!token) return;
        try {
            const userRes = await api.get("/getUser", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const userData = userRes.data;
            setUser(userData);
            setFormData({
                name: userData.name || '',
                number: userData.number || ''
            });
        } catch (err) {
            console.error("Error fetching user data:", err);
            // Optional: Handle token expiration or auth errors here
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSaveImage = async () => {
        if (!selectedImage) return;

        const data = new FormData();
        data.append('profileImage', selectedImage);
        if (user.name) data.append('name', user.name);
        if (user.number) data.append('number', user.number);

        try {
            const res = await api.put("/updateUser", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data', // Axios usually sets this auto for FormData, but good to be explicit or let it handle
                },
            });

            // Axios treats 2xx as success, throws on 4xx/5xx
            const updatedUser = res.data;
            setUser(updatedUser);
            setSelectedImage(null);
            setImagePreview(null);
            alert("Profile image updated successfully!");

        } catch (err) {
            console.error("Update image error:", err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to update image.";
            alert(errorMessage);
        }
    };

    const handleSaveDetails = async () => {
        if (!token) return;
        const data = new FormData();
        data.append('name', formData.name);
        data.append('number', formData.number);
        try {
            const res = await api.put("/updateUser", data, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const updatedUser = res.data;
            setUser(updatedUser);
            setIsEditingDetails(false);
            alert("Profile details updated successfully!");

        } catch (err) {
            console.error("Update details error:", err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to update details.";
            alert(errorMessage);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        getData();
    }, [token]); // Add token as dependency

    return (
        <>
            <Navbar />
            <div className="profile-container">
                <div className="profile-card">
                    {/* Header / Image Section */}
                    <div className="profile-header">
                        <div className="image-container">
                            <div className="image-wrapper" onClick={() => fileInputRef.current.click()}>
                                <img
                                    src={imagePreview || user?.profileImage || "https://placehold.co/150"}
                                    alt="Profile"
                                    className="profile-image"
                                />
                                <div className="image-overlay">
                                    <span>Edit</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                hidden
                                accept="image/*"
                            />
                        </div>

                        {selectedImage && (
                            <div className="image-actions">
                                <button className="btn-confirm" onClick={handleSaveImage}>Save</button>
                                <button className="btn-cancel" onClick={() => {
                                    setSelectedImage(null);
                                    setImagePreview(null);
                                }}>Cancel</button>
                            </div>
                        )}

                        <h2 className="profile-name">{user.name || "User Name"}</h2>
                        <p className="profile-email">{user.email || "email@example.com"}</p>
                    </div>

                    {/* Content Section */}
                    <div className="profile-body">
                        <div className="section-header">
                            <h3>Account Details</h3>
                            {!isEditingDetails && (
                                <button className="btn-edit" onClick={() => setIsEditingDetails(true)}>
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <div className="details-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                {isEditingDetails ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter your name"
                                    />
                                ) : (
                                    <div className="info-display">{user.name || "-"}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                {isEditingDetails ? (
                                    <input
                                        type="text"
                                        name="number"
                                        value={formData.number}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <div className="info-display">{user.number || "-"}</div>
                                )}
                            </div>

                            <div className="form-group full-width">
                                <label>Email Address</label>
                                <div className="info-display locked">{user.email}</div>
                            </div>
                        </div>

                        {isEditingDetails && (
                            <div className="action-buttons">
                                <button className="btn-save" onClick={handleSaveDetails}>Save Changes</button>
                                <button className="btn-discard" onClick={() => {
                                    setIsEditingDetails(false);
                                    setFormData({
                                        name: user.name || '',
                                        number: user.number || ''
                                    });
                                }}>Cancel</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;