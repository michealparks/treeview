import { traverse, type TreeNode } from '$lib'
import { nanoid } from './nanoid'

export const nodes = [
	{
		name: 'Animal GIFs',
		children: [
			{
				name: 'Dogs',
				children: [{ name: 'treadmill.gif' }, { name: 'rope-jumping.gif' }],
			},
			{
				name: 'Goats',
				children: [{ name: 'parkour.gif' }, { name: 'rampage.gif' }],
			},
			{ name: 'cat-roomba.gif' },
			{ name: 'duck-shuffle.gif' },
			{
				name: 'monkey-on-a-pig.gif',
				children: [
					{
						name: 'Dogs',
						children: [{ name: 'treadmill.gif' }, { name: 'rope-jumping.gif' }],
					},
					{
						name: 'Goats',
						children: [{ name: 'parkour.gif' }, { name: 'rampage.gif' }],
					},
					{ name: 'cat-roomba.gif' },
					{ name: 'duck-shuffle.gif' },
					{
						name: 'monkey-on-a-pig.gif',
						children: [
							{
								name: 'Dogs',
								children: [{ name: 'treadmill.gif' }, { name: 'rope-jumping.gif' }],
							},
							{
								name: 'Goats',
								children: [{ name: 'parkour.gif' }, { name: 'rampage.gif' }],
							},
							{ name: 'cat-roomba.gif' },
							{ name: 'duck-shuffle.gif' },
							{
								name: 'monkey-on-a-pig.gif',
								children: [
									{
										name: 'Dogs',
										children: [
											{ name: 'treadmill.gif' },
											{ name: 'rope-jumping.gif' },
											{
												name: 'monkey-on-a-pig.gif',
												children: [
													{
														name: 'Dogs',
														children: [{ name: 'treadmill.gif' }, { name: 'rope-jumping.gif' }],
													},
													{
														name: 'Goats',
														children: [
															{ name: 'parkour.gif' },
															{ name: 'rampage.gif' },
															{
																name: 'monkey-on-a-pig.gif',
																children: [
																	{
																		name: 'Dogs',
																		children: [
																			{ name: 'treadmill.gif' },
																			{ name: 'rope-jumping.gif' },
																		],
																	},
																	{
																		name: 'Goats',
																		children: [{ name: 'parkour.gif' }, { name: 'rampage.gif' }],
																	},
																	{ name: 'cat-roomba.gif' },
																	{ name: 'duck-shuffle.gif' },
																	{ name: 'monkey-on-a-pig.gif' },
																],
															},
														],
													},
													{ name: 'cat-roomba.gif' },
													{ name: 'duck-shuffle.gif' },
													{ name: 'monkey-on-a-pig.gif' },
												],
											},
										],
									},
									{
										name: 'Goats',
										children: [{ name: 'parkour.gif' }, { name: 'rampage.gif' }],
									},
									{ name: 'cat-roomba.gif' },
									{ name: 'duck-shuffle.gif' },
									{ name: 'monkey-on-a-pig.gif' },
									{
										name: 'monkey-on-a-pig.gif',
										children: [
											{
												name: 'Dogs',
												children: [{ name: 'treadmill.gif' }, { name: 'rope-jumping.gif' }],
											},
											{
												name: 'Goats',
												children: [{ name: 'parkour.gif' }, { name: 'rampage.gif' }],
											},
											{ name: 'cat-roomba.gif' },
											{ name: 'duck-shuffle.gif' },
											{ name: 'monkey-on-a-pig.gif' },
										],
									},
								],
							},
						],
					},
				],
			},
		],
	},
] as TreeNode[]

traverse(nodes, (node) => {
	node.icon = {
		path: 'M2.61,21L1.61,19.27L11,13.85V3H13V13.85L22.39,19.27L21.39,21L12,15.58L2.61,21Z',
	}
	node.id = nanoid()
})
