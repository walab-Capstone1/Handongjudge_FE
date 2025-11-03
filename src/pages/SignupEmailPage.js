import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaEnvelope, FaLock, FaUser, FaIdCard, FaEye, FaEyeSlash } from 'react-icons/fa';
import APIService from '../services/APIService';
import tokenManager from '../utils/tokenManager';

const SignUpContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const SignUpCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SignUpTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: black;
  text-align: center;
  margin: 30px 0;
  padding: 0 40px;
`;

const SignUpForm = styled.form`
  padding: 0 40px 40px;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  /* Input 필드의 중앙 정렬: Label 높이 + margin + Input padding-top + Input line-height/2 */
  top: calc(22px + 8px + 16px + 10px); /* 약 56px: Label(22px) + margin(8px) + padding(16px) + input 중앙 보정(10px) */
  transform: translateY(-50%);
  color: #667eea;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  /* Input 필드의 중앙 정렬: 왼쪽 아이콘과 동일한 위치 */
  top: calc(22px + 8px + 16px + 10px); /* 왼쪽 아이콘과 동일한 위치 */
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #5a67d8;
  }
`;

const HelpText = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  margin-bottom: 0;
`;

const ErrorText = styled.p`
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
  margin-bottom: 0;
`;

const SignUpButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BackToLogin = styled.div`
  text-align: center;
  padding: 20px 40px;
  border-top: 1px solid #e5e7eb;
  background: rgba(248, 250, 252, 0.8);
`;

const BackToLoginLink = styled.button`
  color: black;
  text-decoration: none;
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    color: #5a67d8;
    text-decoration: underline;
  }
`;

const SignupEmailPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    studentId: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 해당 필드의 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    // 비밀번호 확인
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    // 이름 검증
    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요.';
    }

    // 학번 검증
    if (!formData.studentId) {
      newErrors.studentId = '학번을 입력해주세요.';
    } else if (!/^\d{8}$/.test(formData.studentId)) {
      newErrors.studentId = '학번은 8자리 숫자여야 합니다. (예: 22100042)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await APIService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        studentId: formData.studentId
      });

      if (response.success) {
        // 토큰 저장 (백엔드 응답에 accessToken이 최상위에 있음)
        if (response.accessToken) {
          tokenManager.setAccessToken(response.accessToken);
        }
        
        alert('회원가입이 완료되었습니다!');
        navigate('/main');
      } else {
        alert(response.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      if (error.message.includes('이미 존재하는 이메일')) {
        setErrors(prev => ({
          ...prev,
          email: '이미 사용 중인 이메일입니다.'
        }));
      } else {
        alert(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <SignUpContainer>
      <SignUpCard>
        <SignUpTitle>이메일 회원가입</SignUpTitle>
        
        <SignUpForm onSubmit={handleSubmit}>
          <InputGroup>
            <Label>이메일</Label>
            <InputIcon>
              <FaEnvelope />
            </InputIcon>
            <Input
              type="email"
              name="email"
              placeholder="example@handong.ac.kr"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
            />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <Label>비밀번호</Label>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="최소 6자 이상"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
            {errors.password && <ErrorText>{errors.password}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <Label>비밀번호 확인</Label>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <Input
              type={showPasswordConfirm ? "text" : "password"}
              name="passwordConfirm"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
              disabled={loading}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            >
              {showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
            {errors.passwordConfirm && <ErrorText>{errors.passwordConfirm}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <Label>이름</Label>
            <InputIcon>
              <FaUser />
            </InputIcon>
            <Input
              type="text"
              name="name"
              placeholder="홍길동"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
            />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <Label>학번</Label>
            <InputIcon>
              <FaIdCard />
            </InputIcon>
            <Input
              type="text"
              name="studentId"
              placeholder="22100042"
              value={formData.studentId}
              onChange={handleInputChange}
              maxLength={8}
              disabled={loading}
            />
            {!errors.studentId && (
              <HelpText>8자리 학번을 입력하세요 (예: 22100042)</HelpText>
            )}
            {errors.studentId && <ErrorText>{errors.studentId}</ErrorText>}
          </InputGroup>

          <SignUpButton type="submit" disabled={loading}>
            {loading ? '회원가입 중...' : '회원가입'}
          </SignUpButton>
        </SignUpForm>

        <BackToLogin>
          <BackToLoginLink onClick={handleBackToLogin} disabled={loading}>
            이미 계정이 있으신가요? 로그인하기
          </BackToLoginLink>
        </BackToLogin>
      </SignUpCard>
    </SignUpContainer>
  );
};

export default SignupEmailPage;

