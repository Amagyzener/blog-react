import { HeartOutlined, HeartFilled } from '@ant-design/icons';


interface IconProps {
	filled: boolean;
	filledColor?: string;
	size?: string | number;
}

export default function IconHeart({ filled, filledColor, size }: IconProps): JSX.Element {
	const styles: React.CSSProperties = { fontSize: size ?? '18px' };
	filled && (styles.color = filledColor ?? '#FF0707');

	return (filled && <HeartFilled style={styles} />) || <HeartOutlined style={styles} />;
}