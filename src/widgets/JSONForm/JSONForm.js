/* eslint-disable react/forbid-prop-types */
/* eslint-disable max-len */
import React, { useImperativeHandle, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import { withTheme } from '@rjsf/core';

import { JSONFormContainer } from './JSONFormContainer';
import { JSONFormField } from './fields/index';
import { JSONFormTemplate } from './templates/index';
import { JSONFormWidget } from './widgets/index';
import { JSONFormErrorList } from './JSONFormErrorList';
import { PageButton } from '../PageButton';
import { JSONFormContext } from './JSONFormContext';
import { booleanSchema } from './testJSON';

const defaultTheme = {
  // Widgets are the lowest level input components. TextInput, Checkbox
  // etc, which are rendered depending on the JSON Schema or, if provided,
  // can be forced to be a specific widget with the uiSchema
  // The default, schema type to widget map, is here:
  // https://github.com/rjsf-team/react-jsonschema-form/blob/b78d9ef280eddf5bda0f97e5a3445c6a1fd35c99/packages/core/src/utils.js#L13
  // You can specify an alternate widget to the the default for a type using the uiSchema.
  // i.e. if the type is "string", but you want to use the DateWidget, in the uiSchema you can specify [fieldName]: {"ui:widget": "date"}
  // https://react-jsonschema-form.readthedocs.io/en/latest/api-reference/uiSchema/
  widgets: {
    TextWidget: JSONFormWidget.Text,
    URLWidget: () => null,
    EmailWidget: () => null,
    TextareaWidget: () => null,
    CheckboxWidget: JSONFormWidget.Checkbox,
    CheckboxesWidget: JSONFormWidget.Checkboxes,
    PasswordWidget: () => null,
    RadioWidget: () => null,
    SelectWidget: JSONFormWidget.Select,
    RangeWidget: () => null,
    DateWidget: JSONFormWidget.Date,
  },

  // Fields are like containers for a row in the form.
  // Can override the DataTypeField components, which are like containers for each of
  // the 'rows' of the form, if needed. See:
  // https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/fields/StringField.js
  //
  // Additionally overriding schemas with anyOf/oneOf fields etc is possible. The full list of overrideable fields:
  // https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/fields/index.js
  // NOTE: It is possible to create any field component to contain a property by specifying the field in the uiSchema which allows a developer to not only override but also create.
  // https://github.com/rjsf-team/react-jsonschema-form/blob/b78d9ef280eddf5bda0f97e5a3445c6a1fd35c99/packages/core/src/components/fields/SchemaField.js#L29-L36
  fields: {
    TitleField: JSONFormField.Title,
    DescriptionField: JSONFormField.Description,

    AnyOfField: JSONFormField.AnyOf,
    OneOfField: JSONFormField.OneOf,

    // Examples of type override
    // StringField: JSONFormField.String,
    // BooleanField: JSONFormField.Boolean,
  },

  // Templates define the layout of each row and are passed components for users to
  // change the layout of each of the rows in the form.
  // See:
  // https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/custom-templates/
  FieldTemplate: JSONFormTemplate.Field,
  ObjectFieldTemplate: JSONFormTemplate.ObjectField,
  ArrayFieldTemplate: JSONFormTemplate.ArrayField,

  // ErrorList is a component which is rendered at the top of the form when validation errors
  // occur
  ErrorList: JSONFormErrorList,

  formContext: JSONFormContext,

  // tagName is a container around the entire form. When the form is a controlled input, there is no access
  // to formData until submit, and the form tries to submit the form HTML style. The FormContainer provided
  // mocks some HTML functionality to make this RN Compatible.
  tagName: JSONFormContainer,
};

class FocusController {
  registered = [];

  registeredScrollView = null;

  registerScrolllView = ref => {
    this.registeredScrollView = ref;
  };

  register = ref => {
    this.registered.push(ref);
  };

  next = ref => {
    const currIdx = this.registered.findIndex(registeredRef => registeredRef === ref);

    const nextIdx = (currIdx + 1) % this.registered.length;
    const nextRef = this.registered[nextIdx];

    nextRef?.current?.focus?.();
    this.registeredScrollView?.current?.scrollTo?.({ x: 0, y: 0, animated: true });

    this.currentIdx = nextIdx;
  };
}

export const JSONForm = React.forwardRef(({ theme = defaultTheme, children, options }, ref) => {
  const formRef = useRef(null);

  const Form = useMemo(() => withTheme(theme), []);

  // Attach to the ref passed a method `submit` which will allow a caller
  // to programmatically call submit
  useImperativeHandle(ref, () => ({
    submit: e => {
      formRef.current?.onSubmit(e);
    },
  }));

  return (
    <JSONFormContext.Provider value={options}>
      <ScrollView
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="always"
        style={{ padding: 20 }}
      >
        <Form
          onError={() => {
            // placeholder to prevent console.errors when validation fails.
          }}
          // eslint-disable-next-line no-console
          onSubmit={form => console.log('onSubmit:', form)}
          ref={formRef}
          schema={booleanSchema}
        >
          {children ?? (
            <PageButton
              onPress={e => {
                formRef.current?.onSubmit(e);
              }}
            />
          )}
        </Form>
      </ScrollView>
    </JSONFormContext.Provider>
  );
});

JSONForm.defaultProps = {
  theme: defaultTheme,
  children: null,
  options: { focusController: new FocusController() },
};

JSONForm.propTypes = {
  children: PropTypes.node,
  options: PropTypes.object,
  theme: PropTypes.shape({
    widgets: PropTypes.shape({
      TextWidget: PropTypes.func,
      URLWidget: PropTypes.func,
      EmailWidget: PropTypes.func,
      TextareaWidget: PropTypes.func,
      CheckboxWidget: PropTypes.func,
      CheckboxesWidget: PropTypes.func,
      PasswordWidget: PropTypes.func,
      RadioWidget: PropTypes.func,
      SelectWidget: PropTypes.func,
      RangeWidget: PropTypes.func,
      DateWidget: PropTypes.func,
    }),
    fields: PropTypes.shape({
      TitleField: PropTypes.func,
      DescriptionField: PropTypes.func,
      AnyOfField: PropTypes.func,
      OneOfField: PropTypes.func,
    }),
    FieldTemplate: PropTypes.func,
    ObjectFieldTemplate: PropTypes.func,
    ArrayFieldTemplate: PropTypes.func,
    ErrorList: PropTypes.func,
    formContext: PropTypes.object,
    tagName: PropTypes.func,
  }),
};