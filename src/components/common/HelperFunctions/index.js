function titleCase(string) {
  return string ? string[0].toUpperCase() + string.slice(1).toLowerCase() : '';
}

export { titleCase };
