let pictureName: string | undefined;

export function setPictureName(name: string) {
  pictureName = `${new Date().getTime()}_${name.trim().split(' ').join('_')}`;
}

export function getPictureName(): string | undefined {
  return pictureName;
}
