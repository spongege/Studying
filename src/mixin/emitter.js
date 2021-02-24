/**
 * 广播方法定义
 * @param String componentName 组件名称
 * @param String eventName 事件名称
 * @param Object params 参数
 */
function broadcast(componentName, eventName, params) {
	// 遍历子组件，对子组件的name进行匹配
	this.$children.forEach(child => {
		var name = child.$options.componentName;
		// 当子组件中的名称匹配到传入的componentName时，在子组件中传入该事件并传递params
		if (name === componentName) {
			// 子组件中与传入的componentName相等时，则在子组件中执行eventName方法，参数为params
			child.$emit.apply(child, [eventName].concat(params));
		} else {
			// 如果不存在则继续执行broadcast方法，this指向子组件
			broadcast.apply(child, [componentName, eventName].concat([params]));
		}
	});
}
export default {
	methods: {
		dispatch(componentName, eventName, params) {
			// 定义父组件对象，如果该组件上面没有对象，则parent为根组件
			var parent = this.$parent || this.$root;
			var name = parent.$options.componentName; // 父组件名称
			// 当父组件对象存在时且父组件名称不等于componentName时，则改变parent值，并将parent值向上赋值；当parent不存在或者name === componentName时，跳出循环
			while (parent && (!name || name !== componentName)) {
				parent = parent.$parent; // parent向上赋值
				// 如果parent存在（即之前的parent含有$parent时）
				if (parent) {
					name = parent.$options.componentName;
				}
			}
			// name === componentName时，则在改组件中执行eventName方法，参数为params
			if (parent) {
				parent.$emit.apply(parent, [eventName].concat(params));
			}
		},
		broadcast(componentName, eventName, params) {
			broadcast.call(this, componentName, eventName, params);
		},
	},
};
