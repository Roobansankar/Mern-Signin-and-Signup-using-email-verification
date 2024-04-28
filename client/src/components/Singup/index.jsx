import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const Signup = () => {
	const [data, setData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		mobileNumber: "",
		password: "",
		image: null, 
	});
	const [error, setError] = useState("");
	const [msg, setMsg] = useState("");
	const [loading, setLoading] = useState(false); 

	const handleChange = ({ currentTarget: input }) => {
		if (input.type === "file") {
			setData({ ...data, image: input.files[0] });
		} else {
			setData({ ...data, [input.name]: input.value });
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true); 
		try {
			const formData = new FormData();
			formData.append("firstName", data.firstName);
			formData.append("lastName", data.lastName);
			formData.append("email", data.email);
			formData.append("mobileNumber", data.mobileNumber);
			formData.append("password", data.password);
			formData.append("image", data.image); 

			const url = "http://localhost:8080/api/users";
			const { data: res } = await axios.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			setMsg(res.message);
		} catch (error) {
			if (
				error.response &&
				error.response.status >= 400 &&
				error.response.status <= 500
			) {
				setError(error.response.data.message);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.signup_container}>
			<div className={styles.signup_form_container}>
				<div className={styles.left}>
					<h1>Welcome Back</h1>
					<Link to="/login">
						<button type="button" className={styles.white_btn}>
							Sign in
						</button>
					</Link>
				</div>
				<div className={styles.right}>
					<form className={styles.form_container} onSubmit={handleSubmit}>
						<h1>Create Account</h1>
						<input
							type="text"
							placeholder="First Name"
							name="firstName"
							onChange={handleChange}
							value={data.firstName}
							required
							className={styles.input}
						/>
						<input
							type="text"
							placeholder="Last Name"
							name="lastName"
							onChange={handleChange}
							value={data.lastName}
							required
							className={styles.input}
						/>
						<input
							type="email"
							placeholder="Email"
							name="email"
							onChange={handleChange}
							value={data.email}
							required
							className={styles.input}
						/>
						<input
							type="text"
							placeholder="Mobile Number"
							name="mobileNumber"
							onChange={handleChange}
							value={data.mobileNumber}
							required
							pattern="[6-9]\d{9}"
							title="Mobile number should be 10 digits long and start with 6, 7, 8, or 9."
							className={styles.input}
						/>

						<input
							type="password"
							placeholder="Password"
							name="password"
							onChange={handleChange}
							value={data.password}
							required
							className={styles.input}
						/>
						<input
							type="file"
							onChange={handleChange}
							className={styles.input}
							required
							accept="image/*" 
						/>

						{error && <div className={styles.error_msg}>{error}</div>}
						{msg && <div className={styles.success_msg}>{msg}</div>}
						<button type="submit" className={styles.green_btn} disabled={loading}>
							{loading ? "Sending Email..." : "Sign Up"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Signup;
