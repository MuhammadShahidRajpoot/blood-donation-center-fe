export function scrollToErrorField(formErrors) {
  //   console.log('scrollToFirstErrorField', formErrors);
  let firstErrorField = Object.keys(formErrors)[0];
  //   console.log('firstErrorField', firstErrorField);

  const firstErrorElement = document.querySelector(
    `[name="${firstErrorField}"]`
  );
  //   console.log('firstErrorElement', firstErrorElement);
  if (firstErrorElement) {
    // console.log('firstErrorElementIN', firstErrorElement);
    firstErrorElement.scrollIntoView({ behavior: 'smooth' });
  }
}
