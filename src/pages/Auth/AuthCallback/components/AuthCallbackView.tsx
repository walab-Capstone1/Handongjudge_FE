import type { AuthCallbackHookReturn } from "../hooks/useAuthCallback";
import * as S from "../styles";

export default function AuthCallbackView(d: AuthCallbackHookReturn) {
	return (
		<S.CallbackContainer>
			<S.CallbackCard>
				<S.LoadingSpinner />
				<S.StatusText>{d.status}</S.StatusText>
				{d.error && <S.ErrorMessage>{d.error}</S.ErrorMessage>}
			</S.CallbackCard>
		</S.CallbackContainer>
	);
}
