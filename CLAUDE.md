## General

Always use our dynamic theme for styling. you can check out @skeletonpill to understand how we use our theme hook and create styles. also always use @AppText for Text and use the role prop for styling. Dont style text sizes etc. individually with own styles.

## Modals

in modals always give ScrollView these props:
keyboardDismissMode="interactive"
bounces={false}
this prevents a nasty bug we had with conflicting scroll gestures.
