import React, { useState, useMemo, useEffect } from 'react';
import {
	modalState,
	getTopicState,
	getLanguageState,
	getCountryState,
	userDetailState,
	topicState,
} from '../state/state';
import {
	useRecoilValue,
	useRecoilState,
	useRecoilValueLoadable,
	useRecoilStateLoadable,
} from 'recoil';

import axios from 'axios';
import './formmypage.css';
import { useHistory } from 'react-router-dom';
import defaultImg from '../../src/assets/mypage/defaultImg.png';

const FormMyPage = () => {
	const [user, setAllDetail] = useRecoilState(userDetailState);
	const topicList = useRecoilValueLoadable(getTopicState);
	const languageList = useRecoilValueLoadable(getLanguageState);
	const countryList = useRecoilValueLoadable(getCountryState);
	const [checkedTopic, setcheckedTopic] = useState(new Array(15).fill(false));
	const userId = localStorage.getItem('user_id');
	//수정 후 갖고 오는 데이터
	const [userDetail, setUserDetail] = useState({
		userid: userId,
		nationality:
			user.userDetail == null ? 'KR' : user.userDetail?.nationality.code,
		gender: user.userDetail == null ? 1 : 0,
		nickname: user.userDetail == null ? '' : user.userDetail?.nickname,
		description: user.userDetail == null ? '' : user.userDetail?.description,
		fluentLanguage:
			user.userLanguage == null ? 'ko' : user.userLanguage?.fluentLanguage.code,
		nativeLanguage:
			user.userLanguage == null ? 'ko' : user.userLanguage?.nativeLanguage.code,
		wantLanguage:
			user.userLanguage == null ? 'en' : user.userLanguage?.wantLanguage.code,
		topicList: user.topicList == [] ? [] : user.topicList,
		profile_image: user.userDetail?.profile_image
			? user.userDetail?.profile_image
			: defaultImg,
	});
	//이미지를 업로드 할 때 필요한 데이터
	const [profileImage, setProfileImage] = useState('');
	//미리 보여주는 이미지
	const [profileimagepreview, setProfileImagePreview] = useState(
		userDetail.profile_image
	);
	const [selectTopic, setSelectTopic] = useState(new Set());

	const topics = useMemo(() => {
		return topicList?.state === 'hasValue' ? topicList?.contents : [];
	}, [topicList]);

	const languages = useMemo(() => {
		return languageList?.state === 'hasValue' ? languageList?.contents : [];
	}, [languageList]);

	const countries = useMemo(() => {
		return countryList?.state === 'hasValue' ? countryList?.contents : [];
	}, [countryList]);

	useEffect(() => {
		if (userDetail.topicList) {
			userDetail.topicList.map((row) => {
				setSelectTopic(selectTopic.add(row.id));
				setcheckedTopic(
					Object.assign(Array.from(checkedTopic), {
						[row.id]: (checkedTopic[row.id] = true),
					})
				);
			});
		}
	}, []);

	const handleTopic = (data, e) => {
		// e.preventDefault();

		if (checkedTopic[data]) {
			selectTopic.delete(data);
			setSelectTopic(selectTopic);
		} else {
			setSelectTopic(selectTopic.add(data));
		}
		// setcheckedTopic((checkedTopic[data] = !checkedTopic[data]));
		setcheckedTopic(
			Object.assign(Array.from(checkedTopic), { [data]: !checkedTopic[data] })
		);
	};

	// detail
	//nationality, gender, nickname, profile_image
	const handleChange = (e) => {
		const { name, value } = e.target;
		// console.log(name + ' ' + value);
		setUserDetail({
			...userDetail,
			[name]: value,
		});
	};
	// profile_image

	const handleFileChange = (e) => {
		e.preventDefault();

		let render = new FileReader();
		let file = e.target.files[0];
		render.onloadend = () => {
			setProfileImagePreview(render.result);
		};
		render.readAsDataURL(file);

		// console.log(file);

		///////////////////////////////////이 위로

		// console.log(e.target);
		const name = e.target.name;
		setUserDetail({
			...userDetail,
			[name]: e.target.files[0],
		});
		setProfileImage(e.target.files[0]);
	};

	const token = 'Bearer ' + localStorage.getItem('token');

	let history = useHistory();

	const handlePutSubmit = async (e) => {
		e.preventDefault();
		userDetail.topicList = Array.from(selectTopic);
		userDetail.profile_image = '2001798500230046.png';
		let data = userDetail;
		// data.userid = userId;
		// console.log(data);
		data = JSON.stringify(data);
		// console.log('Json' + data);
		//text 파일
		if (user.userDetail?.id) {
			await axios
				.put('/api/userdetail', data, {
					headers: {
						Authorization: token,
						'Content-Type': 'application/json',
					},
				})
				.then((res) => {
					console.log(res);
				});
		} else {
			await axios
				.post('/api/userdetail', data, {
					headers: {
						Authorization: token,
						'Content-Type': 'application/json',
					},
				})
				.then((res) => {
					console.log(res);
				});
		}

		// console.log('profileImage' + profileImage);
		if (profileImage != '') {
			const formData = new FormData();
			formData.append('id', userId);
			formData.append('multipartFile', profileImage);
			await axios
				.post('/api/profileimage', formData, {
					headers: {
						Authorization: token,
					},
				})
				.then((res) => {
					console.log(res);
				});
		}
		history.push('/mypage');
	};

	return (
		<div id='userdetailrootbox'>
			<div id='innerrootbox'>
				<form
					onSubmit={handlePutSubmit}
					encType='multipart/form-data'
					action='/mypage'>
					<h2 id='editprofile'>Edit Profile</h2>
					<img
						id='preview'
						src={
							profileimagepreview === user.userDetail?.profile_image
								? '/static/img/' + user.userDetail?.profile_image
								: profileimagepreview
						}
						alt='profile_image'
					/>
					<br />
					<br />
					<h5>Profile Image</h5>
					<label for='profileimagebutton' id='profileimagelabel'>
						Find Image
					</label>
					<input
						id='profileimagebutton'
						type='file'
						accept='image/*'
						name='profile_image'
						onChange={handleFileChange}
					/>

					<label for='nicknametext'>
						<h5>Nickname</h5>
						<input
							id='nicknametext'
							type='text'
							value={userDetail.nickname}
							name='nickname'
							onChange={handleChange}
							placeholder='Insert your nickname'
						/>
					</label>

					<br />
					<br />
					<label for='gender'>
						<h5>Gender</h5>
						<input
							id='radio2'
							name='gender'
							type='radio'
							value='1'
							checked={userDetail.gender == 1}
							onChange={handleChange}
						/>
						<label for='radio2'>Male</label>
						<input
							id='radio1'
							name='gender'
							type='radio'
							value='0'
							checked={userDetail.gender == 0}
							onChange={handleChange}
						/>
						<label for='radio1'>Female</label>
					</label>

					<br />
					<br />
					<label for='description'>
						<h5>Introduce</h5>
						<textarea
							id='description'
							name='description'
							onChange={handleChange}
							type='text'
							value={userDetail.description}
							placeholder='Introduce yourself'
						/>
					</label>

					<br />
					<br />
					<h5>Topic</h5>
					{topics.map((row, idx) => (
						<button
							class='topicbutton'
							type='button'
							style={{
								backgroundColor:
									checkedTopic[row.id] === true ? '#463CBD' : 'white',
								color: checkedTopic[row.id] === true ? 'white' : '#463CBD',
							}}
							key={idx + 1}
							onClick={(e) => handleTopic(row.id, e)}>
							{row.topic}
						</button>
						// <div class="topicDiv" key={idx + 1} onClick={(e) => handleTopic(row.id, e)}>{row.topic}</div>
					))}

					<br />
					<br />
					<h5>Language</h5>
					<br />
					<label for='fluentLanguage'>Fluent Lanaguage</label>
					<select name='fluentLanguage' onChange={handleChange}>
						{languages.map((row, idx) => (
							<option
								key={idx}
								id={row.code}
								value={row.code}
								selected={userDetail.fluentLanguage === row.code}>
								{row.language}
							</option>
						))}
					</select>

					<br />
					<label for='nativeLanguage'>Native Lanaguage</label>
					<select name='nativeLanguage' onChange={handleChange}>
						{languages.map((row, idx) => (
							<option
								key={idx}
								id={row.code}
								value={row.code}
								selected={userDetail.nativeLanguage === row.code}>
								{row.language}
							</option>
						))}
					</select>

					<br />
					<label for='wantLanguage'>Want Lanaguage</label>
					<select name='wantLanguage' onChange={handleChange}>
						{languages.map((row, idx) => (
							<option
								key={idx}
								id={row.code}
								value={row.code}
								selected={userDetail.wantLanguage === row.code}>
								{row.language}
							</option>
						))}
					</select>

					<br />
					<br />
					<label for='nationality'>
						<h5>Nation</h5>
					</label>
					<select name='nationality' onChange={handleChange}>
						{countries.map((row, idx) => (
							<option
								key={idx}
								id={row.code}
								value={row.code}
								selected={userDetail.nationality === row.code}>
								{row.name}
							</option>
						))}
					</select>

					<br />
					<br />
					<div id='uploadbuttonbox'>
						<button id='uploadbutton' type='submit'>
							{' '}
							update
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default FormMyPage;
