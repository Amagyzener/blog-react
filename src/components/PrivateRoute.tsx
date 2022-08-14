import { useLocation, Navigate } from 'react-router-dom';


interface PrivateRouteProps {
	children: JSX.Element;
	redirect: boolean;
	path?: string;
	//roles?: string[];
}

export default function PrivateRoute({ path = '/', redirect, children }: PrivateRouteProps): JSX.Element {
	const location = useLocation();

	return redirect && children || <Navigate to={path} state={{ from: location }} replace />;
}