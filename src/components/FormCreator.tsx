/**
 * [Module] FormCreator
 * [Author] Amagyzenér <dmitry-phs535@ya.ru>
 * [Version] 0.0.0 (09.08.2022) «ShittyShit»
 * [ToDo] Remove AntD components; remove this shit entirely
 * @styles required:
	.container
	.input_container
	.input_wrapper (type = 'checkbox')
	.input_msg
	.commentary
*/
import { Fragment, HTMLInputTypeAttribute, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Divider, Button } from 'antd';
import type { RegisterOptions, SubmitHandler } from 'react-hook-form';


export interface FormCreatorProps {
	caption: string;
	inputs: FormItemProps[];
	onSubmit: SubmitHandler<InputsType>;
	styles: { readonly [key: string]: string };
	action?: string; // button text
	commentary?: JSX.Element;
	extra?: FormItemProps[];
	isFormValid?: boolean; // forcely trigger form validation
}

export interface FormItemProps {
	name: string;
	label?: string; // label + placeholder (text, search, url, tel, email, password, number)
	options?: RegisterOptions; // = { required: true }
	type?: HTMLInputTypeAttribute | 'multiline' | 'taglist'; // = 'text'
	value?: string; // defaultValue
	matches?: [string, string?];
	binder?: {
		fn: (value: string) => boolean;
		bind: string;
	};
	disabled?: boolean;
	onChange?: () => void;
}

export type InputsType = Record<string, string>;

export default function FormCreator({ styles: css, ...props }: FormCreatorProps): JSX.Element {
	const { register, trigger, formState: { errors }, handleSubmit, getValues, watch, setValue } = useForm<InputsType>({
		/* defaultValues: { agreement: 'checked' } */
		/* reValidateMode: 'onSubmit', */
		/* mode: 'all' */
	});

	useEffect(() => {
		!props.isFormValid && trigger();
	}, [props.isFormValid]);

	function _parseInputs(array: FormItemProps[]): JSX.Element {
		const inputs = array.map<JSX.Element>((
			{ name, label = 'This field', options = {}, type = 'text', value = '', matches, binder, disabled = false, onChange }: FormItemProps
		) => {
			const isPlaceholderCompatible = ['text', 'search', 'url', 'tel', 'email', 'password', 'number'].includes(type);

			const watchValue = watch && watch(name);
			if (binder && binder.fn(watchValue || '')) {
				const binded_value = getValues(binder.bind) || '';
				const watchValue_format = watchValue.slice(0, watchValue.length - 1).trim();

				/* watchValue_format.length && (
					binded_value.length
						&& (setValue(binder.bind, `${binded_value} | ${watchValue_format}`), true) // 'true' breaks the chain here
						|| setValue(binder.bind, watchValue_format)
				); */
				watchValue_format.length && setValue(
					binder.bind,
					(binded_value.length > 0) && `${binded_value} | ${watchValue_format}` || watchValue_format
				);
				setValue(name, ''); // clear the 'tags' field
			}

			options = Object.assign({ required: true }, options); // defaults

			matches && (options.validate = {
				isEqual: (v: string) => v === getValues()[matches[0]]
			});

			//console.log(errors[name]?.type);
			let errorMsg: string;
			/* eslint-disable  indent */
			switch (errors[name]?.type) {
				case 'required':
					errorMsg = `${label} is required.`;
					break;
				case 'minLength':
					errorMsg = `${label} needs to be at least ${options.minLength} characters.`;
					break;
				case 'maxLength':
					errorMsg = 'Max length exceeded.';
					break;
				case 'isEqual': // custom equality check
					errorMsg = (matches && matches[1]) ?? 'Validation failed.';
					break;
				/* and so on */
				default: {
					const errorType = errors[name]?.type;
					/* eslint-disable  @typescript-eslint/no-explicit-any */
					errorMsg = (
						options.validate && errorType
							&& (options.validate as Record<string, any>)[errorType]()
					) || 'ERROR_MESSAGE_DEFAULT';
				}
			}

			const error_render = (
				<div key={`${name}_error`} className={css.input_msg}>
					{(typeof options.required == 'string') && options.required || errorMsg}
				</div>
			);
	
			const input_render = [
				(type == 'checkbox') && (
					<div key={`${name}_wrap`} className={css.input_wrapper}>
						<input
							{...register(name, options)}
							id={name}
							aria-invalid={errors[name] ? 'true' : 'false'}
							type={type}
							onChange={onChange}
						/>
						{label && <label htmlFor={name}>{label}</label> || null}
					</div>
				)
				/* || (type == 'radio') && (
					<Radio>{input.label}</Radio>
				) || */
				|| (type == 'multiline') && ( // textarea
					<Fragment key={`${name}_frag`}>
						{label && <label htmlFor={name}>{label}</label> || null}
						<textarea
							{...register(name, options)}
							aria-invalid={errors[name] ? 'true' : 'false'}
							placeholder={label}
							defaultValue={value}
							onChange={onChange}
						/>
					</Fragment>
				) || (type == 'taglist') && (
					<div key={`${name}_wrap`} className={`${css.input_wrapper} ${css.input_taglist}`}>
						<input
							{...register(name, options)}
							aria-invalid={errors[name] ? 'true' : 'false'}
							type='text'
							placeholder='Type a tag and end up with any separator (dot, comma, etc.), and your tag will appear here'
							disabled={disabled}
							style={{ width: '100%' }}
							onChange={onChange}
						/>
						<Button type='default' danger onClick={() => {
							const v = getValues(name);
							const li = v.lastIndexOf(' | ');
							const nv = (li != -1) && v.slice(0, li) || '';
							setValue(name, nv);
						}}>▬</Button>
					</div>
				) || ( // the default case: type = 'text'
					<Fragment key={`${name}_frag`}>
						{label && <label htmlFor={name}>{label}</label> || null}
						<input
							{...register(name, options)}
							aria-invalid={errors[name] ? 'true' : 'false'}
							type={type}
							disabled={disabled}
							placeholder={(isPlaceholderCompatible && label) || undefined}
							defaultValue={value}
							onChange={onChange}
						/>
					</Fragment>
				),
				errors[name] && error_render || null
			];

			return (
				<div key={name} className={css.input_container}>
					{input_render}
				</div>
			);
		});

		return <>{inputs}</>;
	}

	const children_render = _parseInputs(props.inputs);
	const extra_render = props.extra && (
		<>
			<Divider />
			{_parseInputs(props.extra) || null}
		</>
	);

	return (
		<div className={css.container}>
			<form onSubmit={handleSubmit(props.onSubmit)}>
				<h2>{props.caption}</h2>
				{children_render}
				{extra_render}
				<Button htmlType='submit' type='primary' /* disabled={!isValid} */>{props.action}</Button>
				{/* <input type='submit' value={props.action} /> */}
				<div className={css.commentary}>{props.commentary}</div>
			</form>
		</div>
	);
}


FormCreator.defaultProps = {
	action: 'Submit',
	commentary: null,
	extra: null,
	onSubmit: ((data) => console.log(data)) as SubmitHandler<InputsType>,
	isFormValid: true
};